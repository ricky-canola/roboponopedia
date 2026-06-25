import { RoboponData, StatList, StatRangeData } from "@/types"
import data from "@/data/robopon.json";

import { remark } from 'remark';
import html from 'remark-html';

import type {
    InferGetStaticPropsType,
    GetStaticProps,
    GetStaticPaths,
} from "next"
import { StatsTables } from "@/components/statsTable";
import { Summary } from "@/components/summary";
import { RoboponSwitcher } from "@/components/roboponSwitcher";
import RootLayout from "../layout";

interface RoboponPageProps {
    data: RoboponData;
    introHtml: string;

    statRanges: {
        minRanges: StatList<StatRangeData>;
        maxRanges: StatList<StatRangeData>;
        growthRanges: StatList<StatRangeData>;
    }

    enhanceLine: { name: string; id: number; level?: number }[];
}

export const getStaticPaths = (async () => {

    return {
        paths: data.robopon.map(r => ({
            params: {
                id: r.id + ""
            }
        })),
        fallback: false,
    }
}) satisfies GetStaticPaths

export const getStaticProps = (async (context) => {
    const id = parseInt(context.params!.id as string);

    const getPrevious = (name: string): RoboponData | undefined => {
        for (const pon of data.robopon) {
            if (pon.enhances?.name === name) {
                return pon as RoboponData;
            }
        }
    };

    const find = (name: string): RoboponData | undefined => {
        for (const pon of data.robopon) {
            if (pon.name === name) {
                return pon as RoboponData;
            }
        }
    };


    const robopon = data.robopon.find(r => r.id === id) as RoboponData;
    const line: RoboponData[] = [robopon];

    let prev = getPrevious(robopon.name);

    if (prev) {
        while (prev && prev.name !== robopon.name) {
            line.unshift(prev);
            prev = getPrevious(prev.name);
        }
    }

    let next = robopon.enhances?.name;
    if (next) {
        while (next && next !== robopon.name) {
            const nextPon: RoboponData = find(next)!;

            line.push(nextPon);
            next = nextPon.enhances?.name;
        }
    }

    const enhanceLine: RoboponPageProps["enhanceLine"] = [];

    let level: number | undefined = 0;
    for (let i = 0; i < line.length; i++) {
        if (i === 0) {
            enhanceLine.push({
                name: line[i].name,
                id: line[i].id
            });
        }
        else {
            enhanceLine.push({
                name: line[i].name,
                level,
                id: line[i].id
            });
        }
        level = line[i].enhances?.level;
    }

    const md = ">" + robopon.description + "\n\n" + typeMarkdown(robopon) + "\n\n" + enhanceMarkdown(robopon.id, enhanceLine);

    const processedContent = await remark()
        .use(html)
        .process(md);
    const introHtml = processedContent.toString();


    return {
        props: {
            data: robopon,
            enhanceLine,
            introHtml,
            statRanges: data.statRanges
        }
    };
}) satisfies GetStaticProps<RoboponPageProps>

export default function Page({
    data,
    enhanceLine,
    introHtml,
    statRanges
}: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <RootLayout>
            <div>
                <RoboponSwitcher id={data.id} />
                <Summary data={data} />
                <h1>
                    {data.name}
                </h1>
                <div dangerouslySetInnerHTML={{ __html: introHtml }} />
                <StatsTables
                    minStats={data.minStats}
                    minRanges={statRanges.minRanges}
                    maxStats={data.maxStats}
                    maxRanges={statRanges.maxRanges}
                    statGrowth={data.statGrowth}
                    growthRanges={statRanges.growthRanges}
                />
            </div>
        </RootLayout>
    )
}

const url = (text: string, url: string) => `[${text}](${url})`

function typeMarkdown(data: RoboponData) {
    const { type, subType, oilType } = data.type;
    const clause = type === "ARM" ? "an" : "a";
    const typeUrl = filterUrl({ key: "type", value: type });
    const subTypeUrl = filterUrl({ key: "type", value: type }, { key: "subtype", value: subType });
    const oilTypeUrl = filterUrl({ key: "oil", value: oilType });

    return `**${data.name}** is ${clause} ${url(type, typeUrl)} type Robopon with the ${url(subType, subTypeUrl)} subtype. It's oil type is "${url(oilType, oilTypeUrl)}".`
}

function enhanceMarkdown(id: number, line: RoboponPageProps["enhanceLine"]) {
    if (line.length === 1) {
        return `It does not enhance to or from any other Robopon.`
    }

    const index = line.findIndex(entry => entry.id === id);
    if (line.length === 2) {
        if (index === 0) {
            return `It can be enhanced to ${url(line[1].name, roboponUrl(line[1].id))} at level ${line[1].level}.`
        }
        else {
            return `It can be enhanced from ${url(line[0].name, roboponUrl(line[0].id))} at level ${line[1].level}.`
        }
    }
    else {
        if (index === 0) {
            return `It can be enhanced to ${url(line[1].name, roboponUrl(line[1].id))} at level ${line[1].level}, which can be further enhanced to ${url(line[2].name, roboponUrl(line[2].id))} at level ${line[2].level}.`
        }
        else if (index === 1) {
            return `It can be enhanced from ${url(line[0].name, roboponUrl(line[0].id))} at level ${line[1].level} and enhanced to ${url(line[2].name, roboponUrl(line[2].id))} at level ${line[2].level}.`
        }
        else {
            return `It can be enhanced from ${url(line[1].name, roboponUrl(line[1].id))} at level ${line[2].level}. It is the final form of ${url(line[0].name, roboponUrl(line[0].id))}.`
        }
    }
}

function filterUrl(...clauses: { key: string, value: string }[]) {
    return `./#${clauses.map(({key, value}) => `${key}=${value}`).join("&")}`;
}

function roboponUrl(id: number) {
    return `./${id}`;
}