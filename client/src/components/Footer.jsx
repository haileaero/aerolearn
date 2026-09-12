function Footer() {
  return (
    <footer className="footer footer-polished">
      <div>© {new Date().getFullYear()} AeroLearn Academic Cloud</div>
      <div className="footer-meta">
        <span>Secure learning workspace</span>
        <i aria-hidden="true" />
        <span>v4.2</span>
      </div>
    </footer>
  );
}
export default Footer;
