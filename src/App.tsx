import { useState } from 'react'
import './App.css'

function App() {
  type TTodo = {
    title: string
    completed: boolean
    id: number
  }
  const [todos, setTodos] = useState<TTodo[]>([])
  const addTodo = () => {
    const newTodo: TTodo = {
      title: prompt('Введите название задачи') || '',
      completed: false,
      id: Math.random()
    }
    setTodos([...todos, newTodo])
  }

  return (
    <>

      <h1>Todo app</h1>

      <h2>Список задач:</h2>

      <div>
        {
          todos.map((todo) => {
            return (
              <div style={{display: 'flex', alignItems: 'center', gap: '1vw'}} key={todo.id}>
                <div>{todo.title}</div>
                <button>X</button>
              </div>
            )
          })
        }
      </div>
      <button onClick={addTodo}>
        Добавить задачу
      </button>

    </>
  )
}

export default App
