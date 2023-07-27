import React, {FC, MutableRefObject, useMemo, useRef, useState} from 'react';
import {
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  View,
} from 'react-native';

import {TaggingViewProps, MentionPartType, Suggestion} from './types';
import {
  defaultMentionTextStyle,
  generateValueFromPartsAndChangedText,
  generateValueWithAddedSuggestion,
  getMentionPartSuggestionKeywords,
  isMentionPartType,
  parseValue,
} from './utils';

const TaggingView: FC<TaggingViewProps> = ({
  defaultValue,
  onChange,

  partTypes = [],

  inputRef: propInputRef,

  containerStyle,

  onSelectionChange,
  onContentSizeChange,

  ...textInputProps
}) => {
  const textInput = useRef<TextInput | null>(null);

  const [selection, setSelection] = useState({start: 0, end: 0});
  const [inputLength, setInputLength] = useState(0);

  let {plainText, parts} = useMemo(
    () => parseValue(defaultValue, partTypes),
    [defaultValue, partTypes],
  );

  const handleSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
    setSelection(event.nativeEvent.selection);

    onSelectionChange && onSelectionChange(event);
  };

  /**
   * Callback that trigger on TextInput text change
   *
   * @param changedText
   */
  {/*
   1. Firstly current length is compared to previous length to check for backspace event
   2. Iterating on the parts array and checking if the current cursor position is at end position of any object of the parts array and if it is, checking whether it is tagged user or a simple text
   3. If it is tagged user, making isFirst true which is used to handle cases where tagged user is at the beginning of the input followed by removing of that tagged member object from the parts array 
   4. Updating the current length with previous one
   5. Calling the callback of onChange
  */}
  const onChangeInput = (changedText: string) => {
    let isFirst = false;
    let changedLen = changedText.length;
    
    if (changedLen < inputLength) {
      for (let i = 0; i < parts.length; i++) {
        const cursorPosition = selection?.end ?? 0;
        const endPosition = parts[i].position.end;
        if (cursorPosition==endPosition && parts[i].data?.original?.match(new RegExp(/@\[(.*?)\]\((.*?)\)/))) {
            if(i==0) {isFirst = true;}  
            parts = [  ...parts.slice(0, i),
              ...parts.slice(i + 1)]
            break;
        }
      }
    }

    setInputLength(changedLen);
    onChange(
      generateValueFromPartsAndChangedText(parts, plainText, changedText,isFirst),
    );
  };

  /**
   * We memoize the keyword to know should we show mention suggestions or not
   */
  const keywordByTrigger = useMemo(() => {
    return getMentionPartSuggestionKeywords(
      parts,
      plainText,
      selection,
      partTypes,
    );
  }, [parts, plainText, selection, partTypes]);

  /**
   * Callback on mention suggestion press. We should:
   * - Get updated value
   * - Trigger onChange callback with new value
   */
  const onSuggestionPress =
    (mentionType: MentionPartType) => (suggestion: Suggestion) => {
      const newValue = generateValueWithAddedSuggestion(
        parts,
        mentionType,
        plainText,
        selection,
        suggestion,
      );

      if (!newValue) {
        return;
      }

      onChange(newValue);

      /**
       * Move cursor to the end of just added mention starting from trigger string and including:
       * - Length of trigger string
       * - Length of mention name
       * - Length of space after mention (1)
       *
       * Not working now due to the RN bug
       */
    };

  const handleTextInputRef = (ref: TextInput) => {
    textInput.current = ref as TextInput;

    if (propInputRef) {
      if (typeof propInputRef === 'function') {
        propInputRef(ref);
      } else {
        (propInputRef as MutableRefObject<TextInput>).current =
          ref as TextInput;
      }
    }
  };

  const renderMentionSuggestions = (mentionType: MentionPartType) => (
    <React.Fragment key={mentionType.trigger}>
      {mentionType.renderSuggestions &&
        mentionType.renderSuggestions({
          keyword: keywordByTrigger[mentionType.trigger],
          onSuggestionPress: onSuggestionPress(mentionType),
        })}
    </React.Fragment>
  );

  return (
    <TextInput
      multiline
      {...textInputProps}
      ref={handleTextInputRef}
      onChangeText={onChangeInput}
      onContentSizeChange={onContentSizeChange}
      onSelectionChange={handleSelectionChange}>
      <Text>
        {parts.map(({text, partType, data}, index) =>
          partType ? (
            <Text
              key={`${index}-${data?.trigger ?? 'pattern'}`}
              style={partType.textStyle ?? defaultMentionTextStyle}>
              {text}
            </Text>
          ) : (
            <Text key={index}>{text}</Text>
          ),
        )}
      </Text>
    </TextInput>
  );
};

export {TaggingView};
