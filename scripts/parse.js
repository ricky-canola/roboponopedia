const fs = require("fs");
const path = require("path");

const statsPath = path.resolve("stats.txt");
const stats = fs.readFileSync(statsPath, "utf-8");
const out = path.resolve("robopon.json");

const lines = stats.split("\n");
const headerRegex = /^#(\d+)\s+\-\s+(.*)\s*$/;

const sections = [
    "Type",
    "Weigt/Size",
    "Max Level",
    "EXP Curve",
    "Lv1  Stats",
    "LvUp Stats",
    "Max  Stats",
    "Software",
    "Special",
    "Vulnerblty",
    "Enhances",
    "Obtaining",
    "Link Spark",
    "Drops",
    "Steal Drop",
]

const robopon = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = headerRegex.exec(line);

    if (!headerMatch) continue;

    const id = parseInt(headerMatch[1]);
    const name = headerMatch[2];
    const description = lines[i + 2].slice(2, -2);

    console.log(name);

    const stats = parseStats(i + 1);

    robopon.push({
        id,
        name,
        description,
        ...stats
    });
}

fs.writeFileSync(out, JSON.stringify({ robopon }, null, 4));



function parseStats(start) {
    const result = {};

    let i = start;
    while (true) {
        const line = lines[i];

        if (line.charAt(0) === "#") {
            return result;
        }

        const section = line.slice(0, 10).trim();

        const text = line.slice(11).trim();

        const eatLines = () => {
            const eatenLines = [text];

            while (true) {
                i++;
                const line = lines[i];
                if (line.charAt(10) === ":") break;
                eatenLines.push(line.slice(11).trim());
            }

            i--;
            return eatenLines;
        }

        switch (section.toLowerCase()) {
            case "type":
                result.type = parseType(text);
                break;
            case "weigt/size":
                result.weight = text.trim().split("/")[0].trim();
                result.size = text.trim().split("/")[1].trim();
                break;
            case "max level":
                result.maxLevel = parseInt(text.replace("Lv", "").trim());
                break;
            case "exp curve":
                result.expCurve = parseCurve(text);
                break;
            case "lv1 stats":
                result.minStats = parseStatList(text);
                break;
            case "lvup stats":
                result.statGrowth = parseStatList(text);
                break;
            case "max stats":
                result.maxStats = parseMaxStats(eatLines());
                break;
            case "software":
                result.software = parseSoftware(text);
                break;
            case "special":
                const special = parseSpecial(eatLines());
                if (special) {
                    result.special = special;
                }
                break;
            case "vulnerblty":
                result.vulnerability = parseVulnerability(text);
                break;
            case "enhances":
                const enhances = parseEnhances(text);
                if (enhances) {
                    result.enhances = enhances;
                }
                break;
            case "obtaining":
                result.obtain = parseObtaining(eatLines());
                break;
            case "link spark":
                result.linkSpark = parseLinkSpark(eatLines());
                break;
            case "drops":
                result.drop = parsePercentList(text).filter(item => item.name !== "nothing");
                break;
            case "steal drop":
                result.steal = parsePercentList(text).filter(item => item.name !== "nothing");
                return result;
        }

        i++;
    }
}

function parseType(type) {
    const parts = type.split("/");
    const typeParts = parts[0].trim().split(" ");

    return {
        type: typeParts[0],
        subType: typeParts[1],
        oilType: parts[1].trim()
    };
}

function parseCurve(curve) {
    const match = /#\d/.exec(curve)[0];
    return parseInt(match.charAt(1));
}

function parseStatList(stats) {
    stats = stats.trim();

    const result = {};

    const parts = stats.split(/\s+/);
    for (let i = 0; i < 7; i++) {
        result[parts[i * 2]] = parseInt(parts[i * 2 + 1]);
    }

    return result;
}

function parseMaxStats(lines) {
    const result = {};

    if (lines.length === 1) {
        result.acquired = parseStatList(lines[0]);
    }
    else if (lines.length === 4) {
        result.acquired = parseStatList(lines[1]);
        result.enhanced = parseStatList(lines[3]);
    }
    else {
        throw new Error("BAD MAX STATS")
    }

    return result;
}

function parseSoftware(text) {
    if (text.trim() === "-") {
        return [];
    }
    const parts = text.split(",").map(p => p.trim());

    const result = [];
    for (const part of parts) {
        const moveParts = part.split("@").map(p => p.trim());
        result.push({
            name: moveParts[0],
            level: parseInt(moveParts[1].replace("Lv", ""))
        })
    }
    return result;
}

function parseSpecial(lines) {
    if (lines.length === 1) {
        if (lines[0].trim() === "-") {
            return undefined;
        }
    }
    return lines.map(l => l.trim());
}

function parsePercentList(text) {
    const parts = text.split(",").map(p => p.trim());
    const regex = /(\d+(?:\.\d+)?)\%/;

    const result = [];

    for (const part of parts) {
        const match = regex.exec(part);

        if (!match) {
            throw new Error("BAD PERCENT");
        }

        const name = part.replace(match[0], "").trim();
        const percent = parseFloat(match[1]);

        result.push({
            name,
            percent
        })
    }

    return result;
}

function parseVulnerability(text) {
    const result = {};

    for (const type of parsePercentList(text)) {
        result[type.name] = type.percent;
    }

    return result;
}

function parseEnhances(text) {
    if (text.trim() === "-") {
        return undefined;
    }

    const parts = text.split("@").map(p => p.trim());

    return {
        name: parts[0].trim(),
        level: parseInt(parts[1].replace("Lv", "").trim())
    };
}

function parseObtaining(lines) {
    lines = lines.map(l => l.trim()).filter(l => !!l)

    if (lines.length > 1) {
        return {
            method: "special"
        };
    }

    const text = lines[0];
    if (text.trim() === "-") {
        return {
            method: "unknown"
        };
    }

    if (text.indexOf("Enhance") !== -1) {
        return {
            method: "enhance"
        };
    }



    if (text.indexOf("Revive") !== -1) {
        return {
            method: "fossil"
        };
    }

    if (text.indexOf("password") !== -1) {
        return {
            method: "password",
            password: /"([^"]+)"/.exec(text)[1]
        };
    }

    return {
        method: "spark",
        ...parseBatteryList(text)
    };
}

function parseBatteryList(text) {
    text = text.trim();

    const levelMatch = /\(Lv(\d+).*\)/.exec(text);

    const level = parseInt(levelMatch[1]);
    const batteries = text.replace(levelMatch[0], "").split("+").map(p => p.trim());
    return {
        level,
        batteries
    };
}

function parseLinkSpark(lines) {
    if (lines.length === 1) {
        if (lines[0].trim() === "-" || lines[0].startsWith("Spark any")) {
            return [];
        }
    }
    return lines.map(parseBatteryList);
}