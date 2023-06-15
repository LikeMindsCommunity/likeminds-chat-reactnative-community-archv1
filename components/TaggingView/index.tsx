import React, {FC, MutableRefObject, useMemo, useRef, useState} from 'react';
import {
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  View,
} from 'react-native';

import {
  TaggingViewProps,
  MentionPartType,
  Suggestion,
  Part,
  Position,
  CharactersDiffChange,
} from './types';
import {
  defaultMentionTextStyle,
  generateMentionPart,
  generatePlainTextPart,
  generateValueFromPartsAndChangedText,
  // generateValueWithAddedSuggestion,
  getMentionPartSuggestionKeywords,
  getMentionValue,
  getPartsInterval,
  isMentionPartType,
  parseValue,
} from './utils';
import {useAppDispatch, useAppSelector} from '../../store';
import {SET_PREVIOUS_TAG, SET_TAGGED} from '../../store/types/types';
import {diffChars} from 'diff';

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

  const dispatch = useAppDispatch();
  const {taggedData = [], previousTaggedData = []} = useAppSelector(
    state => state.chatroom,
  );

  const {plainText, parts} = useMemo(
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
  const onChangeInput = (changedText: string) => {
    onChange(
      generateValueFromPartsAndChangedText(parts, plainText, changedText),
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
   * Function for generation value from parts array
   *
   * @param parts
   */
  const getValueFromParts = (parts: Part[]) => {
    dispatch({
      type: SET_PREVIOUS_TAG,
      body: {
        taggingData: [...taggedData],
      },
    });
    dispatch({type: SET_TAGGED, body: {taggingData: []}});
    console.log(' hey yayo getValueFromParts ==');
    return parts
      .map((item, index) => {
        console.log('getValueFromParts ==', item, !!item?.data);
        if (!!item?.data) {
          // dispatch({type: SET_TAGGED, body: {taggingData: [...taggedData,item?.text]}});

          dispatch({
            type: SET_TAGGED,
            body: {
              taggingData: [...taggedData, {text: item?.text, index: index}],
            },
          });

          console.log('taggedData ==', taggedData);

          return item?.data ? item?.data?.original : item?.text;
        } else {
          // console.log('taggedData ==', taggedData, item?.text);
          // const changes = diffChars(taggedData, item?.text);
          // dispatch({type: SET_TAGGED, body: {taggingData: ''}});
          let findIndex = previousTaggedData.findIndex(
            (element: any) => element?.index === index,
          );

          console.log('findIndex ==', findIndex, previousTaggedData);

          {
            /* taggedData = Gaurav, item?.text = Gaura
            changes =  [{"count": 5, "value": "Gaura"}, {"added": undefined, "count": 1, "removed": true, "value": "v"}]*/
          }
          // console.log('diffChars changes ==', changes[1]?.count);
          // return changes[1]?.count === 1 && !!changes[1]?.removed
          //   ? ''
          //   : item?.text;
          return findIndex === index ? '' : item?.text;
        }

        // return item.data ? item.data.original : item.text;
      })
      .join('');
  };

  /**
   * Method for adding suggestion to the parts and generating value. We should:
   * - Find part with plain text where we were tracking mention typing using selection state
   * - Split the part to next parts:
   * -* Before new mention
   * -* With new mention
   * -* After mention with space at the beginning
   * - Generate new parts array and convert it to value
   *
   * @param parts - full part list
   * @param mentionType - actually the mention type
   * @param plainText - current plain text
   * @param selection - current selection
   * @param suggestion - suggestion that should be added
   */
  const generateValueWithAddedSuggestion = (
    parts: Part[],
    mentionType: MentionPartType,
    plainText: string,
    selection: Position,
    suggestion: Suggestion,
  ): string | undefined => {
    const currentPartIndex = parts.findIndex(
      one =>
        selection.end >= one.position.start &&
        selection.end <= one.position.end,
    );
    const currentPart = parts[currentPartIndex];

    if (!currentPart) {
      return;
    }

    const triggerPartIndex = currentPart.text.lastIndexOf(
      mentionType.trigger,
      selection.end - currentPart.position.start,
    );

    const newMentionPartPosition: Position = {
      start: triggerPartIndex,
      end: selection.end - currentPart.position.start,
    };

    const isInsertSpaceToNextPart =
      mentionType.isInsertSpaceAfterMention &&
      // Cursor is at the very end of parts or text row
      (plainText.length === selection.end ||
        parts[currentPartIndex]?.text.startsWith(
          '\n',
          newMentionPartPosition.end,
        ));

    return getValueFromParts([
      ...parts.slice(0, currentPartIndex),

      // Create part with string before mention
      generatePlainTextPart(
        currentPart.text.substring(0, newMentionPartPosition.start),
      ),
      generateMentionPart(mentionType, {
        original: getMentionValue(mentionType.trigger, suggestion),
        trigger: mentionType.trigger,
        ...suggestion,
      }),

      // Create part with rest of string after mention and add a space if needed
      generatePlainTextPart(
        `${isInsertSpaceToNextPart ? ' ' : ''}${currentPart.text.substring(
          newMentionPartPosition.end,
        )}`,
      ),

      ...parts.slice(currentPartIndex + 1),
    ]);
  };

  /**
   * Generates new value when we changing text.
   *
   * @param parts full parts list
   * @param originalText original plain text
   * @param changedText changed plain text
   */
  const generateValueFromPartsAndChangedText = (
    parts: Part[],
    originalText: string,
    changedText: string,
  ) => {
    const changes = diffChars(
      originalText,
      changedText,
    ) as CharactersDiffChange[];

    let newParts: Part[] = [];

    let cursor = 0;

    changes.forEach(change => {
      switch (true) {
        /**
         * We should:
         * - Move cursor forward on the changed text length
         */
        case change.removed: {
          cursor += change.count;

          break;
        }

        /**
         * We should:
         * - Push new part to the parts with that new text
         */
        case change.added: {
          newParts.push(generatePlainTextPart(change.value));

          break;
        }

        /**
         * We should concat parts that didn't change.
         * - In case when we have only one affected part we should push only that one sub-part
         * - In case we have two affected parts we should push first
         */
        default: {
          if (change.count !== 0) {
            newParts = newParts.concat(
              getPartsInterval(parts, cursor, change.count),
            );

            cursor += change.count;
          }

          break;
        }
      }
    });

    return getValueFromParts(newParts);
  };

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
