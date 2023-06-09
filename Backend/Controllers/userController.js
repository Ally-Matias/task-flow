// Importação de pacotes.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('email-validator');

// SECRET
const bcryptSecret = process.env.BCRYPT_SECRET;

// Importação de modelos.
const User = require('../Models/User');

// Importação de helpers.
const createUserToken = require('../Helpers/create-user-token');
const getToken = require('../Helpers/get-token');
const sendError = require('../Helpers/errorHelper');
const getUserByToken = require('../Helpers/get-user-by-token');

// Importação de utils.
const errorMessages = require('../Utils/errorMessages');

module.exports = class userController {
  // Método para registrar um usuário.
  static async register(req, res) {
    // Extração dos dados da requisição.
    const { name, email, password, confirmpassword } = req.body;

    // Validação do e-mail utilizando email-validator.
    const eValid = validator.validate(email);

    // Validações.
    if (!name) {
      return sendError(
        res,
        errorMessages.missingName.statusCode,
        errorMessages.missingName.message
      );
    }

    if (!email) {
      return sendError(
        res,
        errorMessages.missingEmail.statusCode,
        errorMessages.missingEmail.message
      );
    }

    if (!eValid) {
      return sendError(
        res,
        errorMessages.invalidEmail.statusCode,
        errorMessages.invalidEmail.message
      );
    }

    if (!password) {
      return sendError(
        res,
        errorMessages.missingPassword.statusCode,
        errorMessages.missingPassword.message
      );
    }

    if (!confirmpassword) {
      return sendError(
        res,
        errorMessages.missingConfirmPassword.statusCode,
        errorMessages.missingConfirmPassword.message
      );
    }

    if (password !== confirmpassword) {
      return sendError(
        res,
        errorMessages.notSamePassword.statusCode,
        errorMessages.notSamePassword.message
      );
    }

    // Verifica se o usuário já existe.
    const userExists = await User.findOne({
      email: email,
    });
    if (userExists) {
      return sendError(
        res,
        errorMessages.userExists.statusCode,
        errorMessages.userExists.message
      );
    }

    // Criptografa a senha.
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Cria um novo usuário.
    const user = new User({
      name: name,
      email: email,
      password: passwordHash,
    });
    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      console.log(error);
      return sendError(
        res,
        errorMessages.notCreateUser.statusCode,
        errorMessages.notCreateUser.message
      );
    }
  }

  // Método para realizar o login de um usuário.
  static async login(req, res) {
    // Extração dos dados da requisição.
    const { email, password } = req.body;

    // Validação do e-mail utilizando email-validator.
    const eValid = validator.validate(email);

    // Validações.
    if (!email) {
      return sendError(
        res,
        errorMessages.missingEmail.statusCode,
        errorMessages.missingEmail.message
      );
    }

    if (!eValid) {
      return sendError(
        res,
        errorMessages.invalidEmail.statusCode,
        errorMessages.invalidEmail.message
      );
    }

    if (!password) {
      return sendError(
        res,
        errorMessages.missingPassword.statusCode,
        errorMessages.missingPassword.message
      );
    }

    // Verifica se o usuário existe.
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      return sendError(
        res,
        errorMessages.userNotExists.statusCode,
        errorMessages.userNotExists.message
      );
    }

    // Verifica a senha.
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return sendError(
        res,
        errorMessages.invalidPassword.statusCode,
        errorMessages.invalidPassword.message
      );
    }
    await createUserToken(user, req, res);
  }

  // Método para verificar se um usuário está autenticado.
  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, bcryptSecret);
      currentUser = await User.findById(decoded.id);
      currentUser.password = undefined;
    } else {
      currentUser = null;
    }
    res.status(200).send(currentUser);
  }

  // Método para retornar o usuario pelo Id.
  static async getUserById(req, res) {
    const id = req.params.id;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return sendError(
        res,
        errorMessages.userNotFound.statusCode,
        errorMessages.userNotFound.message
      );
    }

    res.status(200).json({
      user,
    });
  }

  static async editUser(req, res) {
    const id = req.params.id;

    const token = getToken(req);

    const user = await getUserByToken(token);

    const { name, email, password, confirmpassword } = req.body;

    // Validações
    const eValid = validator.validate(email);

    if (!name) {
      return sendError(
        res,
        errorMessages.missingName.statusCode,
        errorMessages.missingName.message
      );
    }
    user.name = name;

    if (!email) {
      return sendError(
        res,
        errorMessages.missingEmail.statusCode,
        errorMessages.missingEmail.message
      );
    }

    const userExists = await User.findOne({
      email: email,
    });

    if (user.email !== email && userExists) {
      return sendError(
        res,
        errorMessages.userNotFound.statusCode,
        errorMessages.userNotFound.message
      );
    }

    if (!eValid) {
      return sendError(
        res,
        errorMessages.invalidEmail.statusCode,
        errorMessages.invalidEmail.message
      );
    }

    user.email = email;

    if (password !== confirmpassword) {
      return sendError(
        res,
        errorMessages.notSamePassword.statusCode,
        errorMessages.notSamePassword.message
      );
    } else if (password === confirmpassword && password != null) {
      //criação de nova senha
      const [salt, passwordHash] = await Promise.all([
        bcrypt.genSalt(12),
        bcrypt.hash(password, salt),
      ]);
      
      user.password = passwordHash;

      console.log(user);
    }

    try {
      //retorna os dados atualizados
      await User.findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          $set: user,
        },
        {
          new: true,
        }
      );
      res.status(200).json({
        message: 'Usuário atualizado com sucesso!',
      });
    } catch (error) {
      return sendError(
        res,
        errorMessages.notUpdateUser.statusCode,
        errorMessages.notUpdateUser.message
        );
    }
  }
};
