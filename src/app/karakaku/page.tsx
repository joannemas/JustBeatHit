import SongList from "@/components/Karakaku/List";
import styles from '@/stylesheets/songList.module.scss';
import { Circle, CircleArrowLeft } from "lucide-react";


export default function KarakakuPage() {
    return (
        <div className={styles.container}>
            <a href="/" className={styles.backBtn}>
                <CircleArrowLeft size={52} color="white" />
            </a>
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>KARAKAKU</h1>
            </div>
            <p className={styles.subtitle}>Sélectionnez votre musique</p>
            <SongList />
        </div>
    );
}
