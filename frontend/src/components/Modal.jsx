export default function Modal({ open, children }) {
  return (
    <div className={`modal ${open ? 'open' : ''}`}>
      <div className="box">{open && children}</div>
    </div>
  );
}
