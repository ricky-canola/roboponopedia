import styles from "./roboponSwitcher.module.css";
import { formatId, getImageUrl, lookupRobopon } from "./util";

interface Props {
    id: number;
}

export const RoboponSwitcher = ({ id }: Props) => {
    const left = lookupRobopon(id - 1)
    const right = lookupRobopon(id + 1);

    const leftIcon = left && getImageUrl(left, "large");
    const rightIcon = right && getImageUrl(right, "large");

    return (
        <div className={styles.switcher}>
            {leftIcon &&
                <a href={`./${left.id}`} className={styles.button}>
                    <div className={styles.cell}>
                        <img src={leftIcon} className={styles.sprite} />
                    </div>
                    <div className={styles.cell}>
                        <div>
                            {`${formatId(left.id)} ${left.name}`}
                        </div>
                        <div>
                            ←
                        </div>
                    </div>
                </a>
            }
            <div className={styles.spacer} />
            {rightIcon &&
                <a href={`./${right.id}`} className={styles.button}>
                    <div className={styles.cell}>
                        <div>
                            {`${formatId(right.id)} ${right.name}`}
                        </div>
                        <div>
                            →
                        </div>
                    </div>
                    <div className={styles.cell}>
                        <img src={rightIcon} className={styles.sprite} />
                    </div>
                </a>
            }
        </div>
    )
}