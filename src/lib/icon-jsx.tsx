export function BookIcon({ size }: { size: number }) {
  const r = (v: number) => Math.round((v / 512) * size);

  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#4f46e5',
        borderRadius: r(96),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: r(310),
          height: r(368),
          background: 'white',
          borderRadius: r(28),
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Spine */}
        <div
          style={{
            width: r(48),
            height: '100%',
            background: '#818cf8',
            flexShrink: 0,
          }}
        />
        {/* Content lines */}
        <div
          style={{
            flex: 1,
            padding: `${r(44)}px ${r(30)}px ${r(30)}px ${r(22)}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${r(20)}px`,
          }}
        >
          <div style={{ height: r(30), background: '#6366f1', borderRadius: r(15) }} />
          <div style={{ height: r(18), background: '#c7d2fe', borderRadius: r(9) }} />
          <div style={{ height: r(18), background: '#e0e7ff', borderRadius: r(9), width: '80%' }} />
          <div style={{ height: r(18), background: '#c7d2fe', borderRadius: r(9), width: '90%' }} />
          <div style={{ height: r(18), background: '#e0e7ff', borderRadius: r(9), width: '70%' }} />
          <div style={{ height: r(18), background: '#c7d2fe', borderRadius: r(9), width: '85%' }} />
        </div>
      </div>
    </div>
  );
}
