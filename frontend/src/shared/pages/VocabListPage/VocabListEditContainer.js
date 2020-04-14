import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { string, arrayOf, func } from 'prop-types';

import { useForm } from '../../hooks';
import { Overlay, Tabs, Dialog } from '../../layouts';
import { Input, Button } from '../../components';
import VocabForm from './VocabForm';
import VocabEditOverlay from './VocabEditOverlay';
import VocabListEditHeader from './VocabListEditHeader';
import VocabListEditBody from './VocabListEditBody';

const VocabListEditContainer = ({
  id,
  creatorId,
  list,
  addList,
  updateList,
  setNewVocabData,
  getListVocabTranslation,
  setJoyride,
}) => {
  const { t } = useTranslation();
  const newVocabListForm = useForm(['title']);
  const addVocabListForm = useForm(['fileList']);
  const vocabFormInputNames = ['sourceLanguage', 'targetLanguage', 'sourceText', 'targetText'];
  const addVocabForm = useForm(vocabFormInputNames);
  const editVocabForm = useForm(vocabFormInputNames);
  const [count, setCount] = useState(0);
  const [isVocabEditOverlayVisible, setVocabEditOverlayVisibility] = useState(false);
  const [isAddVocabOverlayVisible, setAddVocabOverlayVisibility] = useState(false);
  const [isCreateVocabListOverlayVisible, setCreateVocabListOverlayVisibility] = useState(false);
  const [isDialogVisible, setDialogVisibility] = useState(false);
  const [selectedVocabs, setSelectedVocabs] = useState([]);

  return (
    <>
      <VocabEditOverlay
        id={id}
        title={t('vocablist_form_title_editVocab')}
        isVisible={isVocabEditOverlayVisible}
        form={editVocabForm}
        onCloseButtonClick={() => { setVocabEditOverlayVisibility(false); }}
        updateVocabButtonText={t('common_button_update')}
        onUpdateVocabButtonClick={({ sourceLanguage, targetLanguage, sourceText, targetText }) => {
          const vocabInputData = [sourceLanguage, targetLanguage, sourceText, targetText];
          const data = list.map((item, index) => (count === index ? vocabInputData : item));
          updateList({ variables: { id, data } });
          setVocabEditOverlayVisibility(false);
        }}
      />
      <Overlay
        title={t('vocablist_form_title_newVocab')}
        isVisible={isAddVocabOverlayVisible}
        onCloseButtonClick={() => setAddVocabOverlayVisibility(false)}
      >
        <Tabs
          titles={[t('common_button_create'), t('common_button_upload')]}
          onTabClick={(index) => {
            if (index === 1) setJoyride({ stepIndex: 2, run: true });
          }}
        >
          <content>
            <VocabForm
              id={id}
              form={addVocabForm}
              onTranslateVocabButtonClick={({ sourceLanguage, targetLanguage, sourceLanguageCode, targetLanguageCode, sourceText }) => {
                setNewVocabData([sourceLanguage, targetLanguage, sourceText]);
                getListVocabTranslation({
                  variables: {
                    sourceLanguage: sourceLanguageCode,
                    targetLanguage: targetLanguageCode,
                    sourceText,
                  },
                });
                setAddVocabOverlayVisibility(false);
              }}
            />
          </content>
          <content>
            <form>
              <Input
                label={t('common_button_upload')}
                inputRef={addVocabListForm.formData.fileList.ref}
                type="file"
                name={addVocabListForm.formData.fileList.name}
                pattern={/\.[xls(?x)|csv]+$/}
                patternErrorMessage={t('messages_error_fileTypeIncorrect')}
                onChange={addVocabListForm.updateFormData}
              />
              <Button
                type="secondary"
                disabled={!addVocabListForm.isFormValid}
                text={t('vocablists_form_button_add')}
                onClick={() => {
                  updateList({ variables: { id, file: addVocabListForm.formData.fileList } });
                  setAddVocabOverlayVisibility(false);
                }}
              />
            </form>
          </content>
        </Tabs>
      </Overlay>
      <Overlay
        title={t('vocablist_form_title_newVocabList')}
        isVisible={isCreateVocabListOverlayVisible}
        onCloseButtonClick={() => {
          setCreateVocabListOverlayVisibility(false);
          newVocabListForm.resetFormData();
        }}
      >
        <form>
          <Input
            label={t('vocablist_form_label_newVocabListTitle')}
            inputRef={newVocabListForm.formData.title.ref}
            required
            autoComplete="off"
            name={newVocabListForm.formData.title.name}
            minLength={3}
            maxLength={35}
            pattern={/^[A-Za-zÀ-ÖØ-öø-ÿ0-9_-]/g}
            placeholder={t('vocablist_form_placeholder_newVocabListTitle')}
            value={newVocabListForm.formData.title.value}
            onChange={newVocabListForm.updateFormData}
            onBlur={newVocabListForm.updateFormData}
          />
          <Button
            type="secondary"
            disabled={!newVocabListForm.isFormValid}
            text={t('common_button_create')}
            onClick={() => {
              const data = list.filter((val, index) => selectedVocabs.indexOf(index) !== -1);
              addList({ variables: { name: newVocabListForm.formData.title.value, data, creatorId } });
              setSelectedVocabs([]);
              setCreateVocabListOverlayVisibility(false);
              newVocabListForm.resetFormData();
            }}
          />
        </form>
      </Overlay>

      <Dialog
        title={t('vocablist_dialog_title_deleteVocabs')}
        cancelButtonText={t('common_button_cancel')}
        continueButtonText={t('common_button_ok')}
        isVisible={isDialogVisible}
        onCancelButtonClick={() => setDialogVisibility(false)}
        onContinueButtonClick={() => {
          setCount(0);
          const data = list.filter((val, index) => selectedVocabs.indexOf(index) === -1);
          updateList({ variables: { id, data } });
          setDialogVisibility(false);
          setSelectedVocabs([]);
        }}
      >
        {t('vocablist_dialog_message_deleteVocabsWarning', { numOfVocabsSelected: selectedVocabs.length })}
      </Dialog>
      <VocabListEditHeader
        selectedVocabs={selectedVocabs}
        onDeleteVocabsButtonClick={() => setDialogVisibility(true)}
        onAddVocabButtonClick={() => {
          setJoyride({ stepIndex: 0, run: false });
          setAddVocabOverlayVisibility(true);
        }}
        onAddVocabListButtonClick={() => setAddVocabOverlayVisibility(true)}
        onCreateNewVocabListButtonClick={() => {
          setJoyride({ stepIndex: 3, run: true });
          setCreateVocabListOverlayVisibility(true);
        }}
        onEditVocabListTitleButtonClick={() => setAddVocabOverlayVisibility(true)}
      />
      <VocabListEditBody
        list={list}
        selectedVocabs={selectedVocabs}
        onVocabCheckboxChange={(index) => {
          const vocabs = selectedVocabs.indexOf(index) !== -1
            ? selectedVocabs
              .filter((vocab) => vocab !== index) : selectedVocabs.concat(index);
          setSelectedVocabs(vocabs);
          setCount(index);
        }}
        onVocabEditButtonClick={(index, item) => {
          const [sourceLanguage, targetLanguage, sourceText, targetText] = item;
          editVocabForm.setInitFormData({ sourceLanguage, targetLanguage, sourceText, targetText });
          setCount(index);
          setVocabEditOverlayVisibility(true);
        }}
      />
    </>
  );
};

VocabListEditContainer.propTypes = {
  id: string.isRequired,
  creatorId: string.isRequired,
  list: arrayOf(arrayOf(string)).isRequired,
  addList: func.isRequired,
  updateList: func.isRequired,
  setNewVocabData: func.isRequired,
  getListVocabTranslation: func.isRequired,
  setJoyride: func.isRequired,
};

export default VocabListEditContainer;
