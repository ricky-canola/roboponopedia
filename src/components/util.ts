import { RoboponData } from "@/types";
import data from "@/data/robopon.json";

export function lookupRobopon(id: number): RoboponData | undefined {
    return data.robopon.find(d => d.id === id) as RoboponData;
}

export function getImageUrl(pon: RoboponData, type: "large" | "tiny" | "animated", root = "..") {
    let filename = String(pon.id).padStart(3, "0") + "_" + pon.name;

    if (type === "tiny") {
        filename += "_tiny.png";
    }
    else if (type === "large") {
        filename += "_large.png";
    }
    else {
        filename += "_animated.gif";
    }

    return root + "/sprites/" + filename;
}

export function formatId(id: number) {
    return "#" + (String(id).padStart(3, "0"));
}