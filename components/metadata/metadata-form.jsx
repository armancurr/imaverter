'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function MetadataForm({ metadata, onSave, isProcessing }) {
  // Local state to manage the form's mode and edited values
  const [editableFields, setEditableFields] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // A predefined list of common metadata fields that are safe to edit.
  const commonEditableFields = [
    'Title',
    'Description',
    'Subject',
    'Keywords',
    'Artist',
    'Creator',
    'Copyright',
    'UserComment',
    'ImageDescription',
  ];

  // When the metadata prop changes (e.g., a new file is processed),
  // reset the form to its initial state.
  useEffect(() => {
    setIsEditing(false);
    setEditableFields({});
  }, [metadata]);

  // Update the local state when an input field changes.
  const handleFieldChange = (field, value) => {
    setEditableFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Call the onSave prop passed from the parent with the edited data.
  const handleSave = () => {
    if (Object.keys(editableFields).length === 0) {
      toast.info('No changes were made.');
      setIsEditing(false);
      return;
    }
    onSave(editableFields);
  };

  // Discard changes and exit editing mode.
  const handleCancel = () => {
    setEditableFields({});
    setIsEditing(false);
  };

  if (!metadata) {
    return (
      <div className="text-center text-neutral-500 py-8">
        No metadata available for editing.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex justify-between items-center">
        <h4 className="text-base font-medium text-neutral-300">Edit Fields</h4>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            disabled={isProcessing}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
          >
            Edit Fields
          </Button>
        ) : (
          <div className="space-x-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isProcessing}
              className="bg-gradient-to-b from-green-600 to-green-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Form fields container */}
      <div className="space-y-4">
        {commonEditableFields.map((field) => {
          // Determine the current value from the original metadata
          const currentValue = metadata[field] || '';
          // Use the edited value if it exists, otherwise fall back to the current value
          const editValue = editableFields[field] ?? currentValue;

          return (
            <div key={field}>
              <Label
                htmlFor={field}
                className="block text-sm font-medium text-neutral-400 mb-1"
              >
                {field}
              </Label>
              {isEditing ? (
                <Input
                  id={field}
                  type="text"
                  value={editValue}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="w-full bg-neutral-800 border-neutral-700 text-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${field.toLowerCase()}`}
                  disabled={isProcessing}
                />
              ) : (
                <div className="w-full border border-neutral-800 rounded-md px-3 py-2 bg-neutral-900 text-neutral-300 min-h-[40px] flex items-center">
                  {currentValue || (
                    <span className="text-neutral-500">Not set</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}