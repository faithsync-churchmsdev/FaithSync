import { useState } from 'react';

export function useConfirm() {
  const [state, setState] = useState({
    isOpen: false, title: '', message: '', confirmLabel: '',
    confirmColor: '', icon: '', resolve: null,
  });

  const confirm = (opts) =>
    new Promise((resolve) => {
      setState({ isOpen: true, ...opts, resolve });
    });

  const handleConfirm = () => {
    const res = state.resolve;
    setState(s => ({ ...s, isOpen: false, resolve: null }));
    if (res) res(true);
  };
  const handleCancel = () => {
    const res = state.resolve;
    setState(s => ({ ...s, isOpen: false, resolve: null }));
    if (res) res(false);
  };

  return { confirmState: state, confirm, handleConfirm, handleCancel };
}