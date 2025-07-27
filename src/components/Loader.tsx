import styles from '@/stylesheets/loader.module.scss'

export default function Loader() {
    return (
        <div className={styles.loaderContainer}>
        <div className={styles.spinner}></div>
        </div>
    )
}
