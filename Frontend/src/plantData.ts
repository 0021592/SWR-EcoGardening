import plantInfoText from "../Docs & Files/plant_info.txt?raw";

const plantImages: Record<string, string> = {
  "1": new URL("../Docs & Files/ocimum-basilicum-simple.svg", import.meta.url).href,
  "2": new URL("../Docs & Files/solanum-lycopersicum-simple.svg", import.meta.url).href,
  "3": new URL("../Docs & Files/capsicum-annuum-simple.svg", import.meta.url).href,
  "4": new URL("../Docs & Files/raphanus-sativus-simple.svg", import.meta.url).href,
  "5": new URL("../Docs & Files/cucumis-sativus-simple.svg", import.meta.url).href,
};

const fieldLabels: Record<string, string> = {
  tipologie: "Descriere",
  dificultate: "Dificultate",
  ghiveci_volum: "Volumul ghiveciului",
  ghiveci_adancime_sol: "Adâncimea solului",
  ghiveci_greutate: "Greutatea ghiveciului",
  ghiveci_tip: "Tipul ghiveciului",
  diametru_maturitate: "Dimensiune la maturitate",
  lumina_ore_soare: "Lumină și soare",
  orientare: "Orientare",
  led: "Iluminare LED",
  udare_frecventa: "Udare",
  udare_sensibilitate_exces: "Sensibilitate la udarea excesivă",
  substrat: "Substrat",
  ingrasamant: "Îngrășământ",
  toxicitate_animale: "Toxicitate pentru animale",
  diagnostic: "Diagnostic și soluții",
  recomandari_urban: "Recomandări pentru grădinărit urban",
};

export type GardenLibraryPlant = {
  id: string;
  commonName: string;
  displayName: string;
  botanicalName: string;
  description: string;
  image: string;
  details: { label: string; value: string }[];
};

function shortenPlantName(name: string): string {
  const normalizedName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("ro");
  if (normalizedName.startsWith("busuioc")) return "Busuioc";
  if (normalizedName.startsWith("rosii cherry")) return "Roșii cherry";
  if (normalizedName.startsWith("ardei iute")) return "Ardei iute";
  if (normalizedName.startsWith("ridichi")) return "Ridichi";
  if (normalizedName.startsWith("castravete")) return "Castravete";
  return name.split(/[,(]/, 1)[0].trim();
}

function parsePlantInfo(text: string): GardenLibraryPlant[] {
  const records = text.split(/^\s*---\s*$/m).slice(1);

  return records.map((record) => {
    const values: Record<string, string> = {};
    for (const line of record.split(/\r?\n/)) {
      const separator = line.indexOf("=");
      if (separator === -1) continue;
      values[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
    }
    const id = values.id;
    const image = plantImages[id];

    if (!id || !image || !values.nume_comun || !values.nume_stiintific || !values.tipologie) {
      throw new Error(`Informații incomplete pentru planta cu ID-ul ${id ?? "necunoscut"}.`);
    }

    return {
      id,
      commonName: values.nume_comun,
      displayName: shortenPlantName(values.nume_comun),
      botanicalName: values.nume_stiintific,
      description: values.tipologie ?? "",
      image,
      details: Object.entries(values)
        .filter(([key]) => !["id", "nume_comun", "nume_stiintific"].includes(key))
        .map(([key, value]) => ({
          label: fieldLabels[key] ?? key.replace(/_/g, " "),
          value,
        })),
    };
  });
}

export const gardenLibrary: GardenLibraryPlant[] = parsePlantInfo(plantInfoText);
