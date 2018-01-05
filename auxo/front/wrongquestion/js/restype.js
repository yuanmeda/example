var ResType = (function () {
    function ResType() {
    }
    ResType.isSupportType = function (type) {
        switch (type) {
            case this.CLOUD_SINGLE_CHOICE:
            case this.CLOUD_MULTIPLE_CHOICE:
            case this.CLOUD_INDEFINITE_CHOICE:
            case this.CLOUD_COMPLETION:
            case this.CLOUD_SUBJECTIVITY:
            case this.CLOUD_JUDGMENT:
            case this.CLOUD_MATCHING:
            case this.CLOUD_COMPLEX:
            case this.SINGLE_CHOICE:
            case this.MULTIPLE_CHOICE:
            case this.JUDGMENT:
            case this.SEQUENCING_QUESTION:
            case this.MATCHING:
            case this.ESSAY_QUESTION:
            case this.PUZZLE_QUESTION:
            case this.COMPOSITE_QUESTION:
            case this.COMPLETION:
            case this.HANDWRITE_QUESTION:
            case this.ESSAY:
            case this.WYSIWYG_TEXT:
            case this.READING:
            case this.EXPERIMENT_AND_INQUIRY:
            case this.TABLE_QUESTION:
            case this.MULTI_GAP_FILLING:
            case this.TEXT_CHOICE:
            case this.COMPREHENSIVE_LEARNING:
            case this.APPLICATION:
            case this.CALCULATION:
            case this.EXPLAIN:
            case this.READING_COMPREHENSION:
            case this.PROOF:
            case this.INFERENCE:
            case this.VOTE:
            case this.APPLICATION_BASE:
            case this.PROOF_BASE:
            case this.CALCULATION_BASE:
            case this.EXPLAIN_BASE:
            case this.READING_BASE:
            case this.READING_COMPREHENSION_BASE:
            case this.SUBJECTIVE_BASE:
            case this.SUBJECTIVE_DIRECTIVE:
            case this.NEW_COMPOSITE_QUESTION:
            case this.LINKUP:
            case this.ND_ORDER:
            case this.ND_TABLE:
            case this.H5_GAME:
            case this.NATIVE_GAME:
            case this.ND_WORDPUZZLE:
            case this.ND_MEMORYCARD:
            case this.ND_COUNT:
            case this.ND_COMPARE:
            case this.ND_GUESSWORD:
            case this.ND_MAGICBOX:
            case this.ND_MULTIPLICATION:
            case this.ND_CHEMICALEQUATION:
            case this.ND_TEXTCHOOSE:
            case this.ND_CATEGORY:
            case this.ND_FRACTION:
            case this.ND_LABLE:
            case this.ND_POINTLINE:
            case this.ND_LOGIC:
            case this.ND_BINGO:
            case this.ND_CHOOSEWORD:
            case this.ND_CROSSWORD:
            case this.ND_SEQUENCEFILL:
            case this.ND_IMAGEMARK:
            case this.ND_HIGHLIGHTMARK:
            case this.ND_PROBABILITYCARD:
            case this.ND_CATCHBALL:
            case this.ND_SPEECHEVALUATING:
            case this.ND_BALANCE:
            case this.ND_PLANTING:
            case this.ND_CLOCK:
            case this.ND_LEGO:
            case this.ND_SENTENCE_EVALUATING:
            case this.ND_SENTENCE_EVALUAT:
            case this.ND_GRAPHICSCUTTING:
            case this.APPLICATION_BASE_V2:
            case this.PROOF_BASE_V2:
            case this.CALCULATION_BASE_V2:
            case this.EXPLAIN_BASE_V2:
            case this.READING_BASE_V2:
            case this.READING_COMPREHENSION_BASE_V2:
            case this.ND_PUZZLE:
            case this.ND_SECTION_EVALUATING:
            case this.ND_ABACUS:
            case this.ND_HANDWRITE_QUESTION:
            case this.COMIC_DIALOGUE:
            case this.ND_MATHAXIS:
            case this.ND_COUNTER:
            case this.ND_MAKEWORD:
            case this.ND_MARK_POINT:
            case this.ND_SPELLPOEM:
            case this.ND_INTERVAL_PROBLEM:
            case this.ND_MINDJET:
            case this.ND_OPEN_SHAPE_TOOL:
            case this.ND_CHINESE_CHARACTER_DICTATION:
                return true;
            default:
                return false;
        }
    };
    ResType.isSupportInteractiveType = function (type) {
        switch (type) {
            case this.ND_FRACTION:
            case this.ND_MEMORYCARD:
            case this.ND_CATEGORY:
            case this.ND_TABLE:
            case this.ND_POINTLINE:
            case this.ND_COUNT:
            case this.LINKUP:
            case this.ND_ORDER:
            case this.ND_PROBABILITYCARD:
            case this.ND_TEXTCHOOSE:
            case this.ND_MAGICBOX:
            case this.ND_WORDPUZZLE:
            case this.ND_GUESSWORD:
            case this.ND_CHOOSEWORD:
            case this.ND_COMPARE:
                return true;
            default:
                return false;
        }
    };
    ResType.isComplexType = function (type) {
        switch (type) {
            case this.CLOUD_COMPLEX:
            case this.COMPOSITE_QUESTION:
                return true;
            default:
                return false;
        }
    };
    ResType.CLOUD_SINGLE_CHOICE = "$RE010";
    ResType.CLOUD_MULTIPLE_CHOICE = "$RE015";
    ResType.CLOUD_INDEFINITE_CHOICE = "$RE018";
    ResType.CLOUD_COMPLETION = "$RE020";
    ResType.CLOUD_SUBJECTIVITY = "$RE025";
    ResType.CLOUD_JUDGMENT = "$RE030";
    ResType.CLOUD_MATCHING = "$RE040";
    ResType.CLOUD_COMPLEX = "$RE050";
    ResType.SINGLE_CHOICE = "$RE0201";
    ResType.MULTIPLE_CHOICE = "$RE0202";
    ResType.JUDGMENT = "$RE0203";
    ResType.SEQUENCING_QUESTION = "$RE0204";
    ResType.MATCHING = "$RE0205";
    ResType.ESSAY_QUESTION = "$RE0206";
    ResType.PUZZLE_QUESTION = "$RE0207";
    ResType.COMPOSITE_QUESTION = "$RE0208";
    ResType.COMPLETION = "$RE0209";
    ResType.HANDWRITE_QUESTION = "$RE0210";
    ResType.ESSAY = "$RE0211";
    ResType.WYSIWYG_TEXT = "$RE0212";
    ResType.READING = "$RE0213";
    ResType.EXPERIMENT_AND_INQUIRY = "$RE0214";
    ResType.TABLE_QUESTION = "$RE0215";
    ResType.MULTI_GAP_FILLING = "$RE0216";
    ResType.TEXT_CHOICE = "$RE0217";
    ResType.COMPREHENSIVE_LEARNING = "$RE0218";
    ResType.APPLICATION = "$RE0219";
    ResType.CALCULATION = "$RE0220";
    ResType.EXPLAIN = "$RE0221";
    ResType.READING_COMPREHENSION = "$RE0222";
    ResType.PROOF = "$RE0223";
    ResType.INFERENCE = "$RE0224";
    ResType.VOTE = "$RE0225";
    ResType.APPLICATION_BASE = "$RE0226";
    ResType.PROOF_BASE = "$RE0227";
    ResType.CALCULATION_BASE = "$RE0228";
    ResType.EXPLAIN_BASE = "$RE0229";
    ResType.READING_BASE = "$RE0230";
    ResType.READING_COMPREHENSION_BASE = "$RE0231";
    ResType.SUBJECTIVE_BASE = "$RE0232";
    ResType.SUBJECTIVE_DIRECTIVE = "$RE0233";
    ResType.NEW_COMPOSITE_QUESTION = "$RE0234";
    ResType.LINKUP = "$RE0401";
    ResType.ND_ORDER = "$RE0402";
    ResType.ND_TABLE = "$RE0403";
    ResType.H5_GAME = "$RE0404";
    ResType.NATIVE_GAME = "$RE0405";
    ResType.ND_WORDPUZZLE = "$RE0406";
    ResType.ND_MEMORYCARD = "$RE0407";
    ResType.ND_COUNT = "$RE0408";
    ResType.ND_COMPARE = "$RE0409";
    ResType.ND_GUESSWORD = "$RE0410";
    ResType.ND_MAGICBOX = "$RE0411";
    ResType.ND_MULTIPLICATION = "$RE0412";
    ResType.ND_CHEMICALEQUATION = "$RE0413";
    ResType.ND_TEXTCHOOSE = "$RE0414";
    ResType.ND_CATEGORY = "$RE0415";
    ResType.ND_FRACTION = "$RE0416";
    ResType.ND_LABLE = "$RE0417";
    ResType.ND_POINTLINE = "$RE0418";
    ResType.ND_LOGIC = "$RE0419";
    ResType.ND_BINGO = "$RE0420";
    ResType.ND_CHOOSEWORD = "$RE0421";
    ResType.ND_CROSSWORD = "$RE0422";
    ResType.ND_SEQUENCEFILL = "$RE0423";
    ResType.ND_IMAGEMARK = "$RE0424";
    ResType.ND_HIGHLIGHTMARK = "$RE0425";
    ResType.ND_PROBABILITYCARD = "$RE0426";
    ResType.ND_CATCHBALL = "$RE0427";
    ResType.ND_SPEECHEVALUATING = "$RE0428";
    ResType.ND_BALANCE = "$RE0429";
    ResType.ND_PLANTING = "$RE0430";
    ResType.ND_CLOCK = "$RE0431";
    ResType.ND_LEGO = "$RE0432";
    ResType.ND_SENTENCE_EVALUATING = "$RE0433";
    ResType.ND_SENTENCE_EVALUAT = "$RE0434";
    ResType.ND_GRAPHICSCUTTING = "$RE0435";
    ResType.APPLICATION_BASE_V2 = "$RE0436";
    ResType.PROOF_BASE_V2 = "$RE0437";
    ResType.CALCULATION_BASE_V2 = "$RE0438";
    ResType.EXPLAIN_BASE_V2 = "$RE0439";
    ResType.READING_BASE_V2 = "$RE0440";
    ResType.READING_COMPREHENSION_BASE_V2 = "$RE0441";
    ResType.ND_PUZZLE = "$RE0442";
    ResType.ND_SECTION_EVALUATING = "$RE0443";
    ResType.ND_ABACUS = "$RE0444";
    ResType.ND_HANDWRITE_QUESTION = "$RE0445";
    ResType.COMIC_DIALOGUE = "$RE0446";
    ResType.ND_MATHAXIS = "$RE0447";
    ResType.ND_COUNTER = "$RE0448";
    ResType.ND_MAKEWORD = "$RE0449";
    ResType.ND_MARK_POINT = "$RE0450";
    ResType.ND_SPELLPOEM = "$RE0451";
    ResType.ND_INTERVAL_PROBLEM = "$RE0452";
    ResType.ND_MINDJET = "$RE0453";
    ResType.ND_OPEN_SHAPE_TOOL = "$RE0454";
    ResType.ND_CHINESE_CHARACTER_DICTATION = "$RE0455";
    return ResType;
}());