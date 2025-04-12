import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight:'80vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      textAlign:'center', padding:'40px 20px'
    }} className="page-enter">
      <p style={{ fontFamily:'var(--font-display)', fontSize:'clamp(100px,20vw,200px)',
        color:'var(--black-3)', lineHeight:1, marginBottom:0, userSelect:'none' }}>
        404
      </p>
      <h1 className="display" style={{ fontSize:'clamp(24px,4vw,48px)',
        color:'var(--text-primary)', marginBottom:16, marginTop:-16 }}>
        PAGE NOT FOUND
      </h1>
      <p style={{ color:'var(--text-muted)', fontSize:15, marginBottom:36, maxWidth:360 }}>
        This page doesn't exist or has been moved. Head back to find what you're looking for.
      </p>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
        <button onClick={() => navigate(-1)} className="btn-outline">← Go Back</button>
        <button onClick={() => navigate('/')} className="btn-primary">
          Go Home <i className="fa-solid fa-arrow-right" />
        </button>
      </div>
    </div>
  )
}