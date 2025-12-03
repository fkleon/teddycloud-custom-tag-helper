import { useState } from 'react';
import { Modal, ModalFooter, Button, AlertCard } from './ui';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  tonieData: _tonieData,
  previewJson,
  selectedCover,
  onConfirm,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Call the parent's confirm handler which will create the tonie
      await onConfirm();

      onClose();
    } catch (err) {
      setError(err.userMessage || err.message || 'Failed to save tonie');
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <ModalFooter>
      <Button variant="secondary" onClick={onClose} disabled={isSaving}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleConfirm}
        loading={isSaving}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Tonie'}
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Tonie Creation"
      footer={footer}
      size="xl"
      closeOnOverlayClick={!isSaving}
      closeOnEscape={!isSaving}
    >
      <div className="space-y-4">
        {/* Cover Preview */}
        {selectedCover && (
          <div className="flex justify-center">
            <img
              src={selectedCover.url}
              alt="Cover preview"
              className="w-48 h-48 rounded-lg object-cover shadow-md"
            />
          </div>
        )}

        {/* JSON Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Generated JSON:
          </label>
          <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-4 text-xs overflow-auto max-h-96 font-mono text-gray-900 dark:text-gray-100">
            {JSON.stringify(previewJson, null, 2)}
          </pre>
        </div>

        {/* Error Message */}
        {error && (
          <AlertCard variant="error" title="Error">
            {error}
          </AlertCard>
        )}

        {/* Info about what will happen */}
        <AlertCard variant="info" title="What will happen:">
          <ul className="space-y-1 list-disc list-inside">
            {selectedCover && (
              <li>Cover image will be downloaded and saved to TeddyCloud</li>
            )}
            <li>Tonie JSON will be added to tonies.custom.json</li>
            <li>TeddyCloud configuration will be reloaded</li>
          </ul>
        </AlertCard>
      </div>
    </Modal>
  );
}
