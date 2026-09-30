import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ApiKeyConfig } from '../ApiKeyConfig';
import * as storage from '../../../utils/storage';

jest.mock('../../../utils/storage', () => ({
  readApiKey: jest.fn().mockResolvedValue(null),
  writeApiKey: jest.fn().mockResolvedValue(undefined),
}));

const mockReadApiKey = storage.readApiKey as jest.Mock;
const mockWriteApiKey = storage.writeApiKey as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockReadApiKey.mockResolvedValue(null);
  mockWriteApiKey.mockResolvedValue(undefined);
});

describe('ApiKeyConfig', () => {
  it('renders text input and save button', async () => {
    const { getByTestId, getByText } = render(<ApiKeyConfig />);
    await act(async () => {});
    expect(getByTestId('api-key-input')).toBeTruthy();
    expect(getByText('Salvar')).toBeTruthy();
  });

  it('saves valid key (starting with sk-ant-) and calls onSaved (ESTD-41)', async () => {
    const onSaved = jest.fn();
    const { getByTestId, getByText } = render(<ApiKeyConfig onSaved={onSaved} />);
    await act(async () => {});
    fireEvent.changeText(getByTestId('api-key-input'), 'sk-ant-testkey1234abcd');
    await act(async () => {
      fireEvent.press(getByText('Salvar'));
    });
    expect(mockWriteApiKey).toHaveBeenCalledWith('sk-ant-testkey1234abcd');
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it('shows inline error for invalid key (not starting with sk-ant-) (ESTD-42)', async () => {
    const { getByTestId, getByText } = render(<ApiKeyConfig />);
    await act(async () => {});
    fireEvent.changeText(getByTestId('api-key-input'), 'invalid-key-123');
    await act(async () => {
      fireEvent.press(getByText('Salvar'));
    });
    expect(getByTestId('api-key-error')).toBeTruthy();
    expect(mockWriteApiKey).not.toHaveBeenCalled();
  });

  it('does NOT call writeApiKey for invalid key (ESTD-42)', async () => {
    const { getByTestId, getByText } = render(<ApiKeyConfig />);
    await act(async () => {});
    fireEvent.changeText(getByTestId('api-key-input'), 'not-a-valid-key');
    await act(async () => {
      fireEvent.press(getByText('Salvar'));
    });
    expect(mockWriteApiKey).not.toHaveBeenCalled();
  });

  it('displays masked key (last 4 chars) when key already configured (ESTD-44)', async () => {
    mockReadApiKey.mockResolvedValue('sk-ant-api123456abcd');
    const { getByTestId } = render(<ApiKeyConfig />);
    await act(async () => {});
    const maskedEl = getByTestId('masked-key');
    expect(maskedEl.props.children).toContain('abcd');
    expect(maskedEl.props.children).toContain('••••');
  });

  it('does NOT render full key in any Text element (ESTD-45)', async () => {
    const fullKey = 'sk-ant-full-key-should-never-appear-in-ui';
    mockReadApiKey.mockResolvedValue(fullKey);
    const { queryByText } = render(<ApiKeyConfig />);
    await act(async () => {});
    expect(queryByText(fullKey)).toBeNull();
  });

  it('calls onSaved callback after successful save (ESTD-41)', async () => {
    const onSaved = jest.fn();
    const { getByTestId, getByText } = render(<ApiKeyConfig onSaved={onSaved} />);
    await act(async () => {});
    fireEvent.changeText(getByTestId('api-key-input'), 'sk-ant-validkey9999');
    await act(async () => {
      fireEvent.press(getByText('Salvar'));
    });
    expect(onSaved).toHaveBeenCalled();
  });

  it('clears input field after saving (ESTD-41)', async () => {
    const { getByTestId, getByText } = render(<ApiKeyConfig />);
    await act(async () => {});
    fireEvent.changeText(getByTestId('api-key-input'), 'sk-ant-mykey5678');
    await act(async () => {
      fireEvent.press(getByText('Salvar'));
    });
    expect(getByTestId('api-key-input').props.value).toBe('');
  });

  it('shows updated masked key after save (ESTD-44)', async () => {
    const { getByTestId, getByText } = render(<ApiKeyConfig />);
    await act(async () => {});
    fireEvent.changeText(getByTestId('api-key-input'), 'sk-ant-key0000wxyz');
    await act(async () => {
      fireEvent.press(getByText('Salvar'));
    });
    const maskedEl = getByTestId('masked-key');
    expect(maskedEl.props.children).toContain('wxyz');
  });
});
