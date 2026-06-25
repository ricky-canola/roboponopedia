import styles from "./summary.module.css";
import { RoboponData, RoboponSize, RoboponType, RoboponWeight } from "@/types";
import { formatId, getImageUrl } from "./util";

interface Props {
    data: RoboponData;
}

export const Summary = ({ data }: Props) => {
    const imageUrl = getImageUrl(data, "large");

    return (
        <div className={styles['summary-table']}>
            <div className={styles['summary-header']}>
                <div style={{ flexGrow: 1 }}>
                    {data.name}
                </div>
                <div style={{ fontSize: "1rem", minWidth: "3rem" }}>
                    {formatId(data.id)}
                </div>
            </div>
            <SummaryTableCell>
                <img className={styles.sprite} src={imageUrl} />
            </SummaryTableCell>
            <SummaryTableCell header="Type">
                <div style={{ display: "flex", gap: "0.25rem" }}>
                    <FilterButton
                        filter="type"
                        value={data.type.type}
                        text={getTypeString(data.type.type)}
                        color={getTypeColor(data.type.type)}
                    />
                    <FilterButton
                        filter="subtype"
                        value={data.type.subType}
                        text={getSubtypeString(data.type.subType)}
                        color={getSubtypeColor(data.type.subType)}
                    />
                </div>
            </SummaryTableCell>
            <div className={styles['summary-table-row']}>
                <SummaryTableCell header="Weight">
                    <FilterButton
                        filter="weight"
                        value={data.weight}
                        text={getWeightString(data.weight)}
                    />
                </SummaryTableCell>
                <SummaryTableCell header="Size">
                    <FilterButton
                        filter="size"
                        value={data.size}
                        text={getSizeString(data.size)}
                    />
                </SummaryTableCell>
            </div>
            <SummaryTableCell header="Leveling Rate">
                <FilterButton
                    filter="expcurve"
                    value={data.expCurve + ""}
                    text={getExpCurveString(data.expCurve)}
                />
            </SummaryTableCell>
            <div className={styles['summary-table-row']}>
                <SummaryTableCell header="Oil Type">
                    <FilterButton
                        filter="oiltype"
                        value={data.type.oilType}
                        text={data.type.oilType}
                    />
                </SummaryTableCell>
                <SummaryTableCell header="Max Level">
                    <FilterButton
                        filter="maxlevel"
                        value={data.maxLevel + ""}
                        text={"" + data.maxLevel}
                    />
                </SummaryTableCell>

            </div>
        </div>
    )
}

interface SummaryTableCellProps {
    header?: string;
    children: any;
}

const SummaryTableCell = ({ header, children }: SummaryTableCellProps) => {
    return (
        <div className={styles['summary-table-cell']}>
            {header &&
                <div className={styles['summary-table-cell-header']}>
                    {header}
                </div>
            }
            <div className={styles['summary-table-cell-content']}>
                {children}
            </div>
        </div>
    )
}

interface FilterButtonProps {
    filter: string;
    value: string;
    text: string;
    color?: string;
}

const FilterButton = ({ filter, value, text, color }: FilterButtonProps) => {
    const url = `./#${filter}=${value}`;
    return (
        <a href={url} className={styles['filter-button']} style={{ backgroundColor: color, color: color && "white" }}>{text}</a>
    )
}

function getWeightString(weight: RoboponWeight) {
    switch (weight) {
        case "HEAV": return "Heavy";
        case "LIGHT": return "Light";
        case "NORM": return "Normal";
        case "VHEV": return "Very Heavy"
        case "VLIG": return "Very Light";
    }
}

function getSizeString(size: RoboponSize) {
    switch (size) {
        case "HUGE": return "Huge";
        case "LARGE": return "Large";
        case "NORM": return "Normal";
        case "SMALL": return "Small";
        case "TINY": return "Tiny";
    }
}

function getTypeString(type: RoboponType["type"]) {
    switch (type) {
        case "ARM": return "Arm";
        case "BOOT": return "Boot";
        case "MOVE": return "Move";
    }
}

function getTypeColor(type: RoboponType["type"]) {
    switch (type) {
        case "ARM": return "#E62829";
        case "BOOT": return "#9FA19F";
        case "MOVE": return "#60A1B8";
    }
}

function getSubtypeString(type: RoboponType["subType"]) {
    switch (type) {
        case "DEVIL": return "Devil";
        case "FGT": return "Fight";
        case "GUNNR": return "Gunner";
        case "HEALR": return "Healer";
        case "NIGHT": return "Night";
        case "PUNCH": return "Punch";
        case "SORCR": return "Sorcerer";
        case "THIEF": return "Thief";

        case "LAND": return "Land";
        case "SEA": return "Sea";
        case "SKY": return "Sky";

        case "MAT": return "Mat";
        case "HUMAN": return "Human";
        case "MNSTR": return "Monster";
        case "ANIMA": return "Animal";
    }
}

function getSubtypeColor(type: RoboponType["subType"]) {
    switch (type) {
        case "DEVIL": return "#624d4d";
        case "FGT": return "#ff8001";
        case "GUNNR": return "#9ea19f";
        case "HEALR": return "#ee4178";
        case "NIGHT": return "#6f416f";
        case "PUNCH": return "#40b5a5";
        case "SORCR": return "#9141cb";
        case "THIEF": return "#3fa129";

        case "LAND": return "#905120";
        case "SEA": return "#2880ef";
        case "SKY": return "#3ecff3";

        case "MAT": return "#81b8ee";
        case "HUMAN": return "#f071ef";
        case "MNSTR": return "#afaa81";
        case "ANIMA": return "#fabf00";
    }
}


function getExpCurveString(curve: number) {
    switch (curve) {
        case 1: return "Normal";
        case 2: return "Very Fast";
        case 3: return "Slow";
        case 4: return "Very Slow";
        case 5: return "Fast";
        case 6: return "Slightly Slow";
        default: return "?"
    }
}