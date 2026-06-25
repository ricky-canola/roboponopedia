import { useState } from "react";
import styles from "./statsTable.module.css";

import { RoboponData, StatList, StatRangeData } from "@/types"

interface StatsTablesProps {
    minStats: RoboponData["minStats"];
    maxStats: RoboponData["maxStats"];
    statGrowth: RoboponData["statGrowth"];

    growthRanges: StatList<StatRangeData>;
    minRanges: StatList<StatRangeData>;
    maxRanges: StatList<StatRangeData>;
}

type TableTabs = "Growth" | "Min" | "Max (A)" | "Max (E)"

export const StatsTables = ({ minStats, maxStats, statGrowth, growthRanges, minRanges, maxRanges }: StatsTablesProps) => {
    const [currentTab, setCurrentTab] = useState<TableTabs>("Growth");

    let stats: StatList<number>
    let ranges: StatList<StatRangeData>;

    if (currentTab === "Growth") {
        stats = statGrowth;
        ranges = growthRanges;
    }
    else if (currentTab === "Min") {
        stats = minStats;
        ranges = minRanges;
    }
    else if (currentTab === "Max (A)") {
        stats = maxStats.acquired!;
        ranges = maxRanges;
    }
    else {
        stats = maxStats.enhanced!;
        ranges = maxRanges;
    }

    const tabs: TableTabs[] = ["Growth", "Min"];

    if (maxStats.acquired) {
        tabs.push("Max (A)");
    }
    if (maxStats.enhanced) {
        tabs.push("Max (E)");
    }

    const TAB_PANEL_ID = "stats-tabpanel"

    return (
        <div className={styles['stats-table']}>
            <div role="tablist" className={styles['tab-list']}>
                {tabs.map(t =>
                    <div
                        key={t}
                        className={`${styles['tab']} ${t === currentTab ? styles.selected : ""}`}
                        role="tab"
                        aria-selected={t === currentTab}
                        tabIndex={t === currentTab ? 0 : -1}
                        onClick={() => setCurrentTab(t)}
                        aria-controls={TAB_PANEL_ID}
                    >
                        {t}
                    </div>
                )}
            </div>
            <div id={TAB_PANEL_ID} role="tabpanel">
                <StatsTable
                    stats={stats}
                    ranges={ranges}
                />
            </div>
        </div>
    )
}


interface StatsTableProps {
    stats: StatList<number>;
    ranges: StatList<StatRangeData>;
}

const NAMES: StatList<string> = {
    HP: "HP",
    EP: "EP",
    ATK: "Attack",
    DEF: "Defense",
    FOR: "Force",
    WIL: "Will",
    SPD: "Speed",
}

const COLORS: StatList<string[]> = {
    HP: ["#9EE865", "#69DC12", "#448F0C"],
    EP: ["#F5DE69", "#EFCC18", "#9B8510"],
    ATK: ["#F09A65", "#E86412", "#97410C"],
    DEF: ["#66D8F6", "#14C3F1", "#0D7F9D"],
    FOR: ["#899EEA", "#4A6ADF", "#304591"],
    WIL: ["#E46CCA", "#D51DAD", "#8B1370"],
    SPD: ["#a66ce4", "#911dd5", "#63138b"]
}

const STYLE_VARS = ["--bg-color", "--fill-color", "--border-color"]

export const StatsTable = ({stats, ranges}: StatsTableProps) => {
    const statNames = Object.keys(stats) as (keyof StatList<number>)[];
    return (
        <table className={styles.stats}>
            <tbody>
                {statNames.map(stat => {
                    const value = stats[stat];
                    const range = ranges[stat];

                    const barPercent = ((value - range.min) / (range.max - range.min)) * 100;

                    const colors = COLORS[stat];
                    const style = colors.map((c, i) => `${STYLE_VARS[i]}: ${c}`).join(";");

                    const handleRef = (ref: HTMLTableRowElement) => {
                        if (ref) ref.setAttribute("style", style);
                    }

                    return (
                        <tr key={stat} className={styles['stats-row']} ref={handleRef}>
                            <td>
                                <div className={styles['stats-row-label']}>{NAMES[stat] + ":"}</div>
                                <div className={styles['stats-row-value']}>{stats[stat]}</div>
                            </td>
                            <td className={styles['stats-bar-outer']}>
                                <div className={styles['stats-bar-fill']} style={{ width: barPercent + "%" }} />
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}