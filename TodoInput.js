import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoInput = () => {
  const [todoText, setTodoText] = useState('');
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedTodoIndex, setSelectedTodoIndex] = useState(null);

  useEffect(() => {
    loadTodosFromStorage();
  }, []);

  const loadTodosFromStorage = async () => {
    try {
      const savedTodos = await AsyncStorage.getItem('todos');
      if (savedTodos !== null) {
        setTodos(JSON.parse(savedTodos));
      }
    } catch (error) {
      console.error('Error loading todos from AsyncStorage: ', error);
    }
  };

  const saveTodosToStorage = async (updatedTodos) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Error saving todos to AsyncStorage: ', error);
    }
  };

  const saveCompletedToStorage = async (completed) => {
    try {
      await AsyncStorage.setItem('completedTodos', JSON.stringify(completed));
    } catch (error) {
      console.error('Error saving completed todos to AsyncStorage: ', error);
    }
  };

  const handleInputChange = (text) => {
    setTodoText(text);
  };

  const handleAddTodo = () => {
    if (todoText.trim() !== '') {
      const newTodo = { text: todoText, done: false };
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      saveTodosToStorage(updatedTodos);
      setTodoText('');
    }
  };

  const handleToggleDone = (index) => {
    const updatedTodos = [...todos];
    updatedTodos[index].done = !updatedTodos[index].done;
    setTodos(updatedTodos);
    saveTodosToStorage(updatedTodos);

    if (updatedTodos[index].done) {
      // If the task is marked as done, move it to completed tasks
      const completedTodo = updatedTodos[index];
      setCompletedTodos((prevCompleted) => [...prevCompleted, completedTodo]);
      saveCompletedToStorage([...completedTodos, completedTodo]);

      updatedTodos.splice(index, 1);
      saveTodosToStorage(updatedTodos);
    }
  };

  const handleEditTodo = (index) => {
    setEditingIndex(index);
    setTodoText(todos[index].text);
  };

  const handleUpdateTodo = () => {
    if (editingIndex !== null) {
      const updatedTodos = [...todos];
      updatedTodos[editingIndex].text = todoText;
      setTodos(updatedTodos);
      saveTodosToStorage(updatedTodos);
      setEditingIndex(null);
      setTodoText('');
    }
  };

  const handleRemoveTodo = () => {
    if (selectedTodoIndex !== null) {
      const updatedTodos = [...todos];
      updatedTodos.splice(selectedTodoIndex, 1);
      setTodos(updatedTodos);
      saveTodosToStorage(updatedTodos);
      setSelectedTodoIndex(null);
    }
  };

  const handleRemoveCompletedTodo = (index) => {
    const updatedCompletedTodos = [...completedTodos];
    updatedCompletedTodos.splice(index, 1);
    setCompletedTodos(updatedCompletedTodos);
    saveCompletedToStorage(updatedCompletedTodos);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.header}>Todo List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={todoText}
          onChangeText={handleInputChange}
        />
        {editingIndex === null ? (
          <Button title="Add" onPress={handleAddTodo} color="#5FC4B0" />
        ) : (
          <Button title="Update" onPress={handleUpdateTodo} color="#5FC4B0" />
        )}
      </View>
      <Text style={styles.listTitle}>Tasks:</Text>
      <FlatList
        data={todos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity onPress={() => handleToggleDone(index)}>
              <Text style={item.done ? styles.doneText : styles.todoText}>
                {item.text}
              </Text>
            </TouchableOpacity>
            {editingIndex === index ? (
              <Button title="Update" onPress={handleUpdateTodo} color="#5FC4B0" />
            ) : (
              <>
                <Button title="Edit" onPress={() => handleEditTodo(index)} color="#5FC4B0" />
                <Button
                  title="Remove"
                  onPress={() => handleRemoveTodo(index)} // Fix the remove button
                  color="#FF5733"
                />
              </>
            )}
          </View>
        )}
      />
      <Text style={styles.listTitle}>Completed Tasks:</Text>
      <FlatList
        data={completedTodos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.completedTodoItem}>
            <TouchableOpacity onPress={() => handleRemoveCompletedTodo(index)}>
              <Text style={styles.completedTodoText}>{item.text}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'aquamarine',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: 'green',
    borderWidth: 3,
    padding: 12,
    fontSize: 18,
    borderRadius: 8,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    borderColor: '#333',
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'antiquewhite',
  },
  todoText: {
    flex: 1,
    fontSize: 18,
    color: 'purple',
  },
  doneText: {
    flex: 1,
    fontSize: 18,
    textDecorationLine: 'line-through',
    color: '#888',
  },
  completedTodoItem: {
    borderColor: '#333',
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'lightgreen',
  },
  completedTodoText: {
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
});

export default TodoInput;