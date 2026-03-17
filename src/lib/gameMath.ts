// src/lib/gameMath.ts

export const GameMath = {
    // 1. BONO DE ESCUADRÓN (SQUAD)
    // Fórmula: Si son 5 o más, da 50% base + 5% extra por cada mingle adicional (máx 10).
    getSquadBonus: (squadSize: number): number => {
        return 0;
        // if (squadSize < 5) return 0;
        // return 50 + ((Math.min(squadSize, 10) - 5) * 5);
    },

    // 2. PASIVO INDIVIDUAL DEL MINGLE (CON NIVEL)
    // Fórmula: Pasivo Base + (10% del Pasivo Base por cada Nivel)
    getMinglePassive: (baseValue: number, level: number): number => {
        const levelMultiplier = 1 + (level * 0.1);
        return baseValue * levelMultiplier;
    },

    // 3. CÁLCULO DE TEQUILA FINAL
    // Fórmula: Base generada * (1 + (YieldBonusTotal / 100))
    getFinalTequila: (baseAmount: number, squadSize: number, totalYieldBonus: number): number => {
        const yieldMultiplier = 1 + (totalYieldBonus / 100);
        // Multiplicamos por la cantidad de mingles y aplicamos el bonus
        return Math.floor(baseAmount * squadSize * yieldMultiplier);
    },

    // 4. CÁLCULO DE EXPERIENCIA FINAL (XP)
    // Fórmula: XP Base * (1 + (BonoItemsXP / 100))
    getFinalXp: (baseXp: number, xpBonusFromItems: number): number => {
        const xpMultiplier = 1 + (xpBonusFromItems / 100);
        return Math.floor(baseXp * xpMultiplier);
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