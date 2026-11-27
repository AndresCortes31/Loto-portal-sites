import { useState } from 'react';
import Modal from './Modal.jsx';

const APPROVERS = ['Slilma Garcia', 'Hathziri Carbajal', 'Ingrid Castillo'];

/** Modal de maker-checker: pide motivo y aprobador antes de enviar el cambio. */
export default function ChangeRequestModal({ open, title = 'Solicitar cambio en PROD', summary, currentUser, onCancel, onSubmit }) {
  const approvers = APPROVERS.filter((a) => a !== currentUser);
  const [reason, setReason] = useState('');
  const [approver, setApprover] = useState(approvers[0]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reason.trim()) return setError('Indica el motivo del cambio.');
    setBusy(true);
    try {
      await onSubmit({ reason, approver });
      setReason('');
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open}>
      <h3 style={{ marginBlockStart: 0 }}>{title}</h3>
      <p className="muted">El cambio quedará pendiente hasta que otro administrador lo apruebe.</p>
      {summary && <div className="diff" style={{ marginBottom: 14 }}>{summary}</div>}
      {error && <div className="form-error">{error}</div>}
      <div className="field">
        <label>Motivo del cambio *</label>
        <textarea className="input" style={{ width: '100%', height: 80, padding: 8 }} value={reason}
          onChange={(e) => setReason(e.target.value)} placeholder="Ej. Ajuste solicitado por Finanzas, ticket #4521" />
      </div>
      <div className="field">
        <label>Aprobador</label>
        <select className="select" value={approver} onChange={(e) => setApprover(e.target.value)}>
          {approvers.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn" onClick={onCancel} disabled={busy}>Cancelar</button>
        <button className="btn primary" onClick={submit} disabled={busy}>{busy ? 'Enviando…' : 'Enviar solicitud'}</button>
      </div>
    </Modal>
  );
}
