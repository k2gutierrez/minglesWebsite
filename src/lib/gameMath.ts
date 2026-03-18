// src/lib/gameMath.ts

export const GameMath = {
    // 1. BONO DE ESCUADRÓN (SQUAD)
    // Fórmula: Si son 5 o más, da 50% base + 5% extra por cada mingle adicional (máx 10).
    // getSquadBonus: (squadSize: number): number => {
    //     return 0;
    //     // if (squadSize < 5) return 0;
    //     // return 50 + ((Math.min(squadSize, 10) - 5) * 5);
    // },

    // 2. PASIVO INDIVIDUAL DEL MINGLE (CON NIVEL)
    // Fórmula: Pasivo Base + (10% del Pasivo Base por cada Nivel)
    getMinglePassive: (baseValue: number, level: number): number => {
        const levelMultiplier = 1 + (level * 0.1);
        return baseValue * levelMultiplier;
    },

    // 3. CÁLCULO DE TEQUILA FINAL (CON MULTIPLICADOR GLOBAL DE LA CUENTA)
    // Fórmula: (Base Raid * Multiplicador Global) * (1 + (BonoYieldItemsYPasivos / 100))
    getFinalTequila: (baseAmount: number, globalMultiplier: number, totalYieldBonus: number): number => {
        // El porcentaje extra que dan los pasivos de los mingles que fueron a la raid y los items
        const yieldMultiplier = 1 + (totalYieldBonus / 100);
        
        // Primero multiplicamos la base por el poder de tu cuenta, y luego le sumamos el bono de los items
        return Math.floor((baseAmount * globalMultiplier) * yieldMultiplier);
    },

    // 4. CÁLCULO DE EXPERIENCIA FINAL (XP)
    // Fórmula: (XP Base * Horas Invertidas) * (1 + (BonoItemsXP / 100))
    getFinalXp: (baseXp: number, xpBonusFromItems: number, missionHours: number): number => {
        const xpMultiplier = 1 + (xpBonusFromItems / 100);
        // Multiplicamos la XP por la cantidad de horas (1h = 1x, 12h = 12x, 24h = 24x)
        return Math.floor(baseXp * missionHours * xpMultiplier);
    },

    // 5. PROBABILIDAD DE DROP EXCLUSIVO (REGLA DEL 5%)
    // Fórmula: 5% Base + 1% por Nivel del Mingle
    getExclusiveDropChance: (mingleLevel: number): number => {
        return 5 + mingleLevel;
    },

    // 6. REDUCCIÓN DE TIEMPO POR ITEMS
    // Fórmula: Reduce el tiempo, pero con un tope máximo del 90% para no tener misiones instantáneas
    getReducedDurationSeconds: (baseSeconds: number, timeReductionPercent: number): number => {
        const reductionMultiplier = Math.max(0.1, 1 - (timeReductionPercent / 100));
        return Math.floor(baseSeconds * reductionMultiplier);
    },

    // 7. PROBABILIDAD DE LOOT DEL BOSS
    // Fórmula: Probabilidad Base (Ej: 30%) + Bono de Loot de Mingles/Items
    getBossLootChance: (baseChance: number, totalLootBonus: number): number => {
        // Usamos Math.min para asegurarnos de que nunca pase del 100%
        return Math.min(baseChance + totalLootBonus, 100);
    }
};