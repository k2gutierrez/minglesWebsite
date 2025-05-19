import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
    return (
        <div data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" className="navbar-4 w-nav sm:px-10">
            <div className="w-container">
                <a href="/lair" className="brand w-nav-brand"><img src="images/Mingles_Simbolo_Blanco.png" loading="lazy" sizes="(max-width: 767px) 98vw, (max-width: 991px) 728px, 940px" srcSet="images/Mingles_Simbolo_Blanco-p-500.png 500w, images/Mingles_Simbolo_Blanco-p-800.png 800w, images/Mingles_Simbolo_Blanco-p-1080.png 1080w, images/Mingles_Simbolo_Blanco.png 1652w" alt="" className="image-49" /></a>
                <nav role="navigation" className="w-nav-menu">
                    <a href="/lair" className="nav-link-12 w-nav-link">LAIR</a>
                    <a href="/cava" className="nav-link-13 w-nav-link">CAVA</a>
                    <a href="/prison-break" className="nav-link-14 w-nav-link">PRISON BREAK</a>
                    <a href="/scratch-off" className="nav-link-14 w-nav-link">SCRATCH-OFF</a>
                    <a href="/about" className="nav-link-14 w-nav-link">ABOUT</a>
                    <div className="nav-link-14 w-nav-link pt-3"><ConnectButton /></div>
                </nav>
                <div className="w-nav-button">
                    <div className="w-icon-nav-menu"></div>
                </div>
            </div>
        </div>
    );
}