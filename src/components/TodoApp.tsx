import { useEffect, useState } from "react";
import { TodoItem } from "./TodoItem";
import axios from "axios";
import { sortByAscDates, sortByDescDates } from "../utils/compareTwoDates";
import { ITodo } from "../interfaces";
import { NewTodoInput } from "./NewTodoInput";
import { Box, Flex, Select, Text } from "@chakra-ui/react";
import "../styles/todoApp.css";
import { Header } from "./Header";

export const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://adil-todo-app.onrender.com/"
    : "http://localhost:4000/";

export function TodoApp(): JSX.Element {
  const [allTodos, setAllTodos] = useState<ITodo[]>([]);
  const [newTodoDescription, setNewTodoDescription] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newestLast");

  const pendingTodos = allTodos.filter(
    (todoItem: ITodo) => todoItem.status === "pending"
  );
  const completedTodos = allTodos.filter(
    (todoItem: ITodo) => todoItem.status === "completed"
  );

  // function should only fetch - need to separate the logic to sort todos
  async function fetchTodos() {
    try {
      const response = await axios.get(baseUrl + "items");
      const todos: ITodo[] = response.data;
      const sortedTodos: ITodo[] = [...todos];

      if (sortedTodos.length > 0) {
        switch (sortBy) {
          case "newestLast":
            sortedTodos.sort((a, b) =>
              sortByAscDates(a.creationDate, b.creationDate)
            );
            break;
          case "newestFirst":
            sortedTodos.sort((a, b) =>
              sortByDescDates(a.creationDate, b.creationDate)
            );
            break;
          default:
            break;
        }
      }
      setAllTodos(sortedTodos);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const handleAddNewTodo = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const currentDate = new Date();
    axios
      .post(baseUrl + "items", {
        description: newTodoDescription,
        status: "pending",
        creationDate: currentDate,
      })
      .then(() => {
        setNewTodoDescription("");
        fetchTodos();
      })
      .catch((error) => console.log(error));
  };

  const handleDeleteTodo = (e: { preventDefault: () => void }, id: number) => {
    e.preventDefault();
    axios
      .delete(`${baseUrl}items/${id}`)
      .then(() => {
        console.log(`Deleted todo with ID: ${id}`);
        fetchTodos();
      })
      .catch((error) =>
        console.log(`error found in handleDelete todo ${error}`)
      );
  };

  const handleUpdateStatus = (id: number) => {
    const todoWithGivenId = allTodos.find(
      (todoItem: ITodo) => todoItem.id === id
    ) as ITodo;

    if (todoWithGivenId.status === "pending") {
      axios
        .patch(`${baseUrl}items/${id}`, {
          description: todoWithGivenId.description,
          status: "completed",
        })
        .then(() => fetchTodos())
        .catch((error) => console.log(error));
    } else {
      axios
        .patch(`${baseUrl}items/${id}`, {
          description: todoWithGivenId.description,
          status: "pending",
        })
        .then(() => fetchTodos())
        .catch((error) => console.log(error));
    }
  };

  const handleSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switch (e.target.value) {
      case "newestLast":
        setSortBy("newestLast");
        break;
      case "newestFirst":
        setSortBy("newestFirst");
        break;
      default:
        break;
    }
    fetchTodos();
  };

  return (
    <div className="todo-app">
      <Flex direction="column">
        <Header />
        <NewTodoInput
          onSubmitNewTodo={handleAddNewTodo}
          newTodo={newTodoDescription}
          setNewTodo={setNewTodoDescription}
        />
        <Flex justify="right" align="center" mt={2}>
          <Box w="80px">Sort by</Box>
          <Box w="150px">
            <Select name="sortPendingTodosBy" onChange={handleSortBy}>
              <option value="newestLast">Oldest first</option>
              <option value="newestFirst">Newest first</option>
            </Select>
          </Box>
        </Flex>

        <Box>
          <Text>Pending</Text>
          {pendingTodos.map((todoItem: ITodo) => (
            <TodoItem
              key={todoItem.id}
              id={todoItem.id}
              todo={todoItem}
              onDelete={handleDeleteTodo}
              onUpdateStatus={handleUpdateStatus}
              refreshTodos={fetchTodos}
            />
          ))}
        </Box>
        <Box>
          <Text>Completed</Text>
          {completedTodos.map((todoItem: ITodo) => (
            <TodoItem
              key={todoItem.id}
              id={todoItem.id}
              todo={todoItem}
              onDelete={handleDeleteTodo}
              onUpdateStatus={handleUpdateStatus}
              refreshTodos={fetchTodos}
            />
          ))}
        </Box>
      </Flex>
    </div>
  );
}
