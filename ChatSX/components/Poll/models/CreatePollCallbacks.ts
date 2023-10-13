export interface CreatePollCallbacks {
  onChange: (event: any, selectedValue: any) => void;
  showDatePicker: () => void;
  handleQuestion: (val: string) => void;
  handleShowAdvanceOption: () => void;
  handleAddOptions: (val: boolean) => void;
  handleAnonymousPoll: (val: boolean) => void;
  handleLiveResults: (val: boolean) => void;
  handleInputOptionsChangeFunction: (index: any, value: any) => void;
  removeAnOption: (index: any) => void;
  addNewOption: () => void;
  postPoll: () => void;
  hideActionModal: () => void;
  hideSelectOptionModal: () => void;
  handleOnSelect: (val: number) => void;
  handleOnSelectOption: (val: number) => void;
  handleOpenActionModal: () => void;
  handleOpenOptionModal: () => void;
  resetDateTimePicker: () => void;
}
