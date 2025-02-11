import SongList from "@/components/Karakaku/List";
import '@/stylesheets/module.songList.scss';
import { Circle, CircleArrowLeft } from "lucide-react";


export default function KarakakuPage() {
    return (
        <div className="container">
            <a href="/" className="back-btn">
                <CircleArrowLeft size={52} color="white" />
            </a>
            <div className="title-container">
                <h1 className="title">KARAKAKU</h1>
            </div>
            <p className="subtitle">Sélectionnez votre musique</p>
            <SongList />
        </div>
    );
}
