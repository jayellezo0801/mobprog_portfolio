import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoInput = () => {
  const [todoText, setTodoText] = useState('');
  const [todos, setTodos] = useState([]);
  const [editingTodoIndex, setEditingTodoIndex] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [selectedTodos, setSelectedTodos] = useState([]); // To keep track of selected todos

  useEffect(() => {
    // Load saved todos from AsyncStorage when the component mounts
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

  const handleInputChange = (text) => {
    setTodoText(text);
  };

  const handleAddTodo = () => {
    if (todoText.trim() !== '') {
      const updatedTodos = [...todos, { text: todoText }];
      setTodos(updatedTodos);
      saveTodosToStorage(updatedTodos);
      setTodoText('');
    }
  };

  const handleLongPress = (index) => {
    // Set the index of the item to be edited
    setEditingTodoIndex(index);
    setEditedText(todos[index].text);
  };

  const handleEditTodo = () => {
    // Update the todo text and clear the editing state
    const updatedTodos = [...todos];
    updatedTodos[editingTodoIndex].text = editedText;
    setTodos(updatedTodos);
    saveTodosToStorage(updatedTodos);
    setEditingTodoIndex(null);
  };

  const handleToggleSelectTodo = (index) => {
    // Toggle the selected state of the todo item
    if (selectedTodos.includes(index)) {
      setSelectedTodos(selectedTodos.filter((item) => item !== index));
    } else {
      setSelectedTodos([...selectedTodos, index]);
    }
  };

  const handleDeleteSelectedTodos = () => {
    // Delete the selected todos
    const updatedTodos = todos.filter((_, index) => !selectedTodos.includes(index));
    setTodos(updatedTodos);
    saveTodosToStorage(updatedTodos);
    setSelectedTodos([]);
  };

  const handleDoneTodos = () => {
    // Move selected todos to the "Tasks Done" storage
    const doneTodos = selectedTodos.map((index) => todos[index].text);

    // Add the doneTodos to the "Tasks Done" storage
    saveDoneTasks(doneTodos);

    // Remove the selected todos from the current todos list
    const updatedTodos = todos.filter((_, index) => !selectedTodos.includes(index));
    setTodos(updatedTodos);

    // Clear the selected todos
    setSelectedTodos([]);
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.centeredContent}>
        


         <TextInput
          style={styles.input}
          placeholder="Enter a new sentence"
          value={todoText}
          onChangeText={handleInputChange}
        />
        <View style={styles.buttonContainer}>
          <Button title="Add" onPress={handleAddTodo} color={"green"} />
          <Button title="Remove" onPress={handleDeleteSelectedTodos} color="red" />

        </View>
        <Text style={styles.listTitle} >List:</Text>
        <FlatList
          data={todos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.todoItemContainer}>
              <TouchableOpacity
                onLongPress={() => handleLongPress(index)}
                onPress={() => handleToggleSelectTodo(index)}
                style={styles.todoItem}
              >
                {selectedTodos.includes(index) ? (
                  <Text style={styles.selectedTodoText}>{item.text}</Text>
                ) : editingTodoIndex === index ? (
                  <>
                    <TextInput
                      style={styles.editableTodoItem}
                      value={editedText}
                      onChangeText={setEditedText}
                      underlineColorAndroid="transparent"
                      editable={true}
                      selectTextOnFocus={true}
                    />
                    <Button title="Save" onPress={handleEditTodo} />
                  </>
                ) : (
                  <Text style={styles.todoText}>{item.text}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContent: {
    width: '100%',
  },
  input: {
    borderColor: 'gray', // Add border
    borderWidth: 1,
    padding: 10,
    marginBottom: -.3,
  },
  buttonContainer: {
    marginBottom: -.2,
  },
  listTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white'
  },
  todoItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 5,
  },
  editableTodoItem: {
    flex: 1,
    borderColor: 'gray', // Add border
    borderWidth: 1,
    padding: 10,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  selectedTodoText: {
    flex: 1,
    fontSize: 16,
    textDecorationLine: 'underline',
  },

});

export default TodoInput;