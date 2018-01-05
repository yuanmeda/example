import utils from "utils";

class Tree {
    constructor(data) {
        this.data = this.convertToTreeData(data);
    }

    convertToTreeData(data) {
        return utils.getChapterTree(data);
    }
}