import React, { useEffect, useState, useCallback } from 'react'

import { Link } from 'react-router-dom'

import api from '../../utils/api'

import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { TaskCard } from '../../components/TaskCard'

import {
  Container,
  Sidebar,
  LogoContainer,
  TaskInput,
  TextArea,
  Main,
  Header,
  ButtonSearch,
  ButtonLogin,
  Title,
  TasksContainer,
  TaskList,
} from './styles'

function Home() {
  const [tasks, setTasks] = useState([])
  const [token] = useState(localStorage.getItem('token'))
  const [buttonClicked, setButtonClicked] = useState(false)

  async function getMyTasks() {
    try {
      const { data } = await api.get('/tasks/mytasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setTasks(data.tasks)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (buttonClicked) {
      window.location.href = '/SignIn'
    }
  }, [buttonClicked])

  useEffect(() => {
    getMyTasks()
  })

  return (
    <Container>
      <Sidebar>
        <LogoContainer>
          <a href="">
            <img
              alt="icone do projeto"
              src="src/assets/img/favicon.ico"
              height="60"
              width="60"
            />
          </a>
          <h2
            style={{
              color: '#fff',
              marginTop: '10px',
            }}
          >
            Task Flow
          </h2>
        </LogoContainer>

        <TaskInput>
          <Input placeholder="Título da Tarefa" />
          <TextArea placeholder="Descrição da tarefa" />
          <Button type="submit" title="Cadastrar Nova Tarefa" />
        </TaskInput>
      </Sidebar>

      <Main>
        <Link to="/SignIn">
          <ButtonLogin onClick={() => setButtonClicked(true)}>
            Login
          </ButtonLogin>
        </Link>

        <Header>
          <div
            style={{
              display: 'flex',
            }}
          >
            <Input placeholder="Pesquisar Tarefa" />
            <ButtonSearch>
              <a href="">
                <img
                  alt="icone de search"
                  src="src/assets/img/search.png"
                  height="19"
                  width="19"
                />
              </a>
            </ButtonSearch>
          </div>
        </Header>

        <TasksContainer>
          <div>
            <Title>Tarefas</Title>
          </div>
          <TaskList>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                title={task.title}
                description={task.description}
              />
            ))}
          </TaskList>
        </TasksContainer>
      </Main>
    </Container>
  )
}

export default Home
