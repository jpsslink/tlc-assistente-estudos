import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChecklistItem } from '../ChecklistItem';

describe('ChecklistItem', () => {
  it('renders the label text', () => {
    const { getByText } = render(
      <ChecklistItem label="Test label" checked={false} onToggle={jest.fn()} />
    );
    expect(getByText('Test label')).toBeTruthy();
  });

  it('renders checkmark when checked=true', () => {
    const { getByText } = render(
      <ChecklistItem label="Test" checked={true} onToggle={jest.fn()} />
    );
    expect(getByText('✓')).toBeTruthy();
  });

  it('calls onToggle with true when unchecked item is pressed', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <ChecklistItem label="Test" checked={false} onToggle={onToggle} />
    );
    fireEvent.press(getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('calls onToggle with false when checked item is pressed', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <ChecklistItem label="Test" checked={true} onToggle={onToggle} />
    );
    fireEvent.press(getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('renders without crash when disabled=true', () => {
    const { getByRole } = render(
      <ChecklistItem label="Disabled item" checked={false} onToggle={jest.fn()} disabled={true} />
    );
    expect(getByRole('checkbox')).toBeTruthy();
  });

  it('does not call onToggle when disabled and pressed', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <ChecklistItem label="Disabled" checked={false} onToggle={onToggle} disabled={true} />
    );
    fireEvent.press(getByRole('checkbox'));
    expect(onToggle).not.toHaveBeenCalled();
  });
});
