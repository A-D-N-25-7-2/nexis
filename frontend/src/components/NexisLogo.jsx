const NexisLogo = () => {
  return (
    <svg width="100%" viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="680" height="300" fill="#0d0d0d" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap');

        .base {
          font-family: 'Montserrat', sans-serif;
          font-size: 96px;
          font-weight: 700;
          letter-spacing: 22px;
        }
        .glitch-r {
          font-family: 'Montserrat', sans-serif;
          font-size: 96px;
          font-weight: 700;
          letter-spacing: 22px;
          fill: #ff0020;
          opacity: 0;
          animation: glitch-red 4s infinite;
        }
        .glitch-b {
          font-family: 'Montserrat', sans-serif;
          font-size: 96px;
          font-weight: 700;
          letter-spacing: 22px;
          fill: #1a0000;
          opacity: 0;
          animation: glitch-dark 4s infinite;
        }
        .slice1 { animation: slice-anim1 4s infinite; }
        .slice2 { animation: slice-anim2 4s infinite; }

        @keyframes glitch-red {
          0%,89%,100% { opacity: 0; transform: translate(0,0); }
          90%          { opacity: 0.7; transform: translate(-4px, 0); }
          92%          { opacity: 0.7; transform: translate(4px, 2px); }
          94%          { opacity: 0.7; transform: translate(-2px, -2px); }
          96%          { opacity: 0; }
        }
        @keyframes glitch-dark {
          0%,89%,100% { opacity: 0; transform: translate(0,0); }
          90%          { opacity: 0.5; transform: translate(4px, 0); }
          92%          { opacity: 0.5; transform: translate(-4px, -2px); }
          94%          { opacity: 0.5; transform: translate(2px, 2px); }
          96%          { opacity: 0; }
        }
        @keyframes slice-anim1 {
          0%,89%,100% { opacity: 0; transform: translate(0,0); }
          90%          { opacity: 1; transform: translate(-6px, 0); }
          93%          { opacity: 1; transform: translate(6px, 0); }
          95%          { opacity: 0; }
        }
        @keyframes slice-anim2 {
          0%,91%,100% { opacity: 0; transform: translate(0,0); }
          92%          { opacity: 1; transform: translate(5px, 0); }
          94%          { opacity: 1; transform: translate(-5px, 0); }
          96%          { opacity: 0; }
        }
        .flicker {
          animation: flicker 4s infinite;
        }
        @keyframes flicker {
          0%,85%,87%,89%,100% { opacity: 1; }
          86%                  { opacity: 0.2; }
          88%                  { opacity: 0.8; }
        }
      `}</style>

      <defs>
        <clipPath id="slice1">
          <rect x="0" y="148" width="680" height="18" />
        </clipPath>
        <clipPath id="slice2">
          <rect x="0" y="172" width="680" height="12" />
        </clipPath>
      </defs>

      <text
        className="base flicker"
        x="340"
        y="196"
        textAnchor="middle"
        fill="#E8232A"
      >
        NEXIS
      </text>
      <text className="glitch-r" x="340" y="196" textAnchor="middle">
        NEXIS
      </text>
      <text className="glitch-b" x="340" y="196" textAnchor="middle">
        NEXIS
      </text>

      <text
        className="slice1"
        x="340"
        y="196"
        textAnchor="middle"
        clipPath="url(#slice1)"
        style={{
          fontFamily: "'Montserrat',sans-serif",
          fontSize: "96px",
          fontWeight: 700,
          letterSpacing: "22px",
          fill: "#E8232A",
        }}
      >
        NEXIS
      </text>

      <text
        className="slice2"
        x="340"
        y="196"
        textAnchor="middle"
        clipPath="url(#slice2)"
        style={{
          fontFamily: "'Montserrat',sans-serif",
          fontSize: "96px",
          fontWeight: 700,
          letterSpacing: "22px",
          fill: "#E8232A",
        }}
      >
        NEXIS
      </text>
    </svg>
  );
};

export default NexisLogo;
