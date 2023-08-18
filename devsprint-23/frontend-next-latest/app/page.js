export default function Home() {
  return (
    <div className="hero min-h-screen" style={{backgroundImage: 'url(https://c4.wallpaperflare.com/wallpaper/410/867/750/vector-forest-sunset-forest-sunset-forest-wallpaper-preview.jpg)'}}>
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-md relative bottom-10">
          <h1 className="m-5 text-5xl font-bold">Welcomeee !!!</h1>
          <p className="mb-5">Login using your Google Account.</p>
          <button className="btn btn-primary">Login</button>
        </div>
      </div>
    </div>
  )
}