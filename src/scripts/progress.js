const STORAGE_KEY = "jik_progress";

const Progress = {
    /**
     * Estrutura salva no localStorage:
     * {
     *   "tutorial_grammar": {
     *     "tutorial_vocab": true,
     *     "tutorial_audio": false,
     *     ...
     *   },
     *   "persona": { ... },
     *   ...
     * }
     */

    _data: null,

    /** Carrega o progresso do localStorage (ou inicializa vazio) */
    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            this._data = raw ? JSON.parse(raw) : {};
        } catch {
            this._data = {};
        }
        return this._data;
    },

    /** Salva o progresso atual no localStorage */
    _save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    },

    /** Garante que _data esteja carregado */
    _ensure() {
        if (!this._data) this.load();
    },

    /**
     * Marca um subMode como completo.
     * @param {string} gameModeId  - ex: "tutorial_grammar"
     * @param {string} subModeId   - ex: "tutorial_vocab"
     */
    completeSubMode(gameModeId, subModeId) {
        this._ensure();
        if (!this._data[gameModeId]) {
            this._data[gameModeId] = {};
        }
        this._data[gameModeId][subModeId] = true;
        this._save();
        console.log(this._data)
    },

    /**
     * Verifica se um subMode foi completado.
     * @param {string} gameModeId
     * @param {string} subModeId
     * @returns {boolean}
     */
    isSubModeComplete(gameModeId, subModeId) {
        this._ensure();
        return !!(this._data[gameModeId] && this._data[gameModeId][subModeId]);
    },

    /**
     * Verifica se TODOS os subModes de um gameMode foram completados.
     * Precisa receber a lista de subModeIds esperados para comparação.
     * @param {string} gameModeId
     * @param {string[]} subModeIds - lista de todos os subMode ids daquele gameMode
     * @returns {boolean}
     */
    isGameModeComplete(gameModeId, subModeIds) {
        this._ensure();
        if (!this._data[gameModeId]) return false;
        return subModeIds.every((id) => this._data[gameModeId][id] === true);
    },

    /**
     * Retorna quantos subModes foram completados em um gameMode.
     * @param {string} gameModeId
     * @param {string[]} subModeIds
     * @returns {{ completed: number, total: number }}
     */
    getGameModeProgress(gameModeId, subModeIds) {
        this._ensure();
        const completed = subModeIds.filter((id) =>
            this.isSubModeComplete(gameModeId, id)
        ).length;
        return { completed, total: subModeIds.length };
    },

    /**
     * Retorna o progresso geral considerando todos os gameModes.
     * @param {Array} gameModes - array de gameModes do JSON (com .id e .subModes)
     * @returns {{ completed: number, total: number }}
     */
    getOverallProgress(gameModes) {
        this._ensure();
        let completed = 0;
        let total = 0;
        for (const gm of gameModes) {
            const ids = gm.subModes.map((s) => s.id);
            total += ids.length;
            completed += ids.filter((id) =>
                this.isSubModeComplete(gm.id, id)
            ).length;
        }
        return { completed, total };
    },

    /** Reseta todo o progresso */
    reset() {
        this._data = {};
        this._save();
    },

    /** Reseta o progresso de um gameMode específico */
    resetGameMode(gameModeId) {
        this._ensure();
        delete this._data[gameModeId];
        this._save();
    },
};
