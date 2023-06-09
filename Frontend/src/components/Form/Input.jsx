import InputForm from './styles.js';

function Input({
    type,
    text,
    name,
    placeholder,
    handleOnChange,
    value,
    multiple,
}) {
    return (
        <div>
            <InputForm
                type={type}
                name={name}
                id={name}
                placeholder={placeholder}
                onChange={handleOnChange}
                value={value}
                {...(multiple ? { multiple } : {})}
            />
        </div>
    );
}

export default Input
