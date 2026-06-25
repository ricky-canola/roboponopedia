import RootLayout from "../layout";
import styles from "./index.module.css";

import data from "../../data/robopon.json";
import { RoboponData } from "@/types";
import { formatId, getImageUrl } from "@/components/util";
import { useEffect, useState } from "react";

export default function Page() {
    const [filters, setFilters] = useState<Filter[]>([]);

    useEffect(() => {
        const parseHash = () => {
            let hash = window.location.hash;
            hash = hash?.replace("#", "");

            if (hash) {
                const params = new URLSearchParams(hash);
                const filters: Filter[] = [];

                for (const key of params.keys()) {
                    filters.push({
                        key,
                        value: params.get(key)!
                    })
                }
                setFilters(filters);
            }
        }

        parseHash();
        window.addEventListener("hashchange", () => parseHash());
    }, []);

    return (
        <RootLayout>
            <div className={styles['card-list']}>
                {getFiltered(filters).map(pon =>
                    <RoboponCard key={pon.id} data={pon as RoboponData} />
                )}
            </div>
        </RootLayout>
    );
}

interface RoboponCardProps {
    data: RoboponData;
}

interface Filter {
    key: string;
    value: string;
}

const RoboponCard = ({ data }: RoboponCardProps) => {
    return (
        <a href={"./robopon/" + data.id} className={styles.card}>
            <div className={styles.content}>
                <div className={styles.cell}>
                    <img src={getImageUrl(data, "large", ".")} alt={data.name} />
                </div>
                <div className={styles.cell}>
                    {formatId(data.id) + " - " + data.name}
                </div>
            </div>
        </a>
    )
}

function getFiltered(filters: Filter[]): RoboponData[] {
    return (data.robopon as RoboponData[]).filter(pon => !filters.some(({ key, value }) => !checkFilter(key, value, pon)))
}

function checkFilter(key: string, value: string, pon: RoboponData) {
    switch (key) {
        case "type": return pon.type.type === value;
        case "subtype": return pon.type.subType === value;
        case "oil": return pon.type.oilType === value;
        case "weight": return pon.weight === value;
        case "size": return pon.size === value;
        case "maxlevel": return pon.maxLevel === parseInt(value);
        case "expcurve": return pon.expCurve === parseInt(value);
    }

    return true;
}