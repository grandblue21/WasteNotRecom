import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const Categories = ({ categories, onCategoryChange }) => {
  const [categoryIndex, setCategoryIndex] = useState(0);

  const handleCategoryChange = (index, item) => {
    setCategoryIndex(index);
    onCategoryChange(index, item);
  };
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryContainer}>
      {categories.map((item, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={0.8}
          onPress={() => handleCategoryChange(index, item)}
          style={index < categories.length - 1 ? styles.categoryItem : null}>
          <Text
            style={[
              styles.categoryText,
              categoryIndex === index && styles.categoryTextSelected,
            ]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: '10%', // Ensure the content is at least as wide as the screen
    justifyContent: 'flex-start', // Start from the left
    paddingStart:"5%",
  },
  categoryItem: {
    marginRight: 28,
  },
  categoryText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9C9999',
    letterSpacing: 1,
    paddingHorizontal:8,
  },
  categoryTextSelected: {
    color: '#389F4F',
    textDecorationLine: 'underline',
  },
});

export default Categories;