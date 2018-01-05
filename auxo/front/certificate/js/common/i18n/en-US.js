i18n.certificate = {
    goods: {
        // 物流信息
        goodInfo: "Package Info",
        // 暂无物流节点
        noGoodsFlow: "No tracks of goods."
    },
    certSearch: {
        // 证书查询
        certificateSearch: "Certificate Search",
        // 查询
        search: "search",
        // 查询中
        searching: "search...",
        // 证件号码
        idNum: "ID No.",
        // 证书编号
        certNum: "Cert No.",
        // 姓名
        name: "Name",
        // 加载更多
        loadMore: "Load more.",
        // 加载中...
        loading: "loading...",
        // 无此类证书
        noCert: "No such certificate",
        // 请至少输入2项查询条件
        conditionLimit: "Please enter at least 2 query conditions.",
        // 注：任意输入以上两项内容即可查询。
        queryNote: "Note: Any input more than two content can query.",

        keepSearch: "Keep Searching"

    },
    view: {
        // 证书详情
        detail: "Certificate Details"
    },
    // 证书查询页：templates/certificate/query.ftl
    query: {
        queryTitle: "Certificate query",
        userIdCard: "IdCard",
        certificateNumber: "Number",
        userRealName: "Name",
        helpBlock: "Note: Input any two of them can query",
        queryBtnLabel: "Query",
        resultTitle: "Query results",
        backBtnLabel: "Back",
        noData: "No query to relevant information",
        tipHeader: "Friendship tips",
        tipContent: "Input any two of them can query"
    },
    // 证书详情页：templates/certificate/detail.ftl
    detail: {
        opencourse: "opencourse",
        plan: "plan",
        train: "train",
        prog: {
            condition: "Please pass those courses before apply the certificate：",
            applyBtnLabel: "Apply",
            course: "courses",
            hour: "Hours",
            exam: "exams",
            passed: "<i class='status-icon icon-certificate finished' data-flag='passed'></i>",
            fail: "<i class='status-icon icon-certificate no' data-flag='failed'></i>",

            title: "Progress:",
            audit: "Audit",
            applying: "Applying",
            deliver: "Send certificate",
            successfulApplication: "Success",
            unsuccessfulApplication: "Failed",
            hasGottenBtnLabel: "Acknowledged receipt",
            descForExpressName: "Sending certificate",
            descForExpressNumber: "Courier number",
            expressLabel: "Click to view logistics information",
            descForDeliver: "Successful, send certificate later!",
            descForVirtualDeliver: "Successful! Click to receive an electronic certificate!",
            receiveBtnLabel: "Receive certificate",
            applyAgainBtnLabel: "Apply again",
            informationIsNotPassed: "The information does not pass the audit:",
            contactCustomerService: "（If you have any questions, please contact customer service.）"
        },
        gainTime: "Fetch time:",
        introduction: "Certificate introduction",
        appraise: "Certificate comment",
        logistics: "Logistics information"
    },
    //全部证书页：templates/certificate/allcertificate.ftl
    all: {
        //可申请证书
        canApplyCertificates: 'Certificates of application',
        //不可申请
        nonApplication: 'unapply',
        //申请中
        application: 'applying',
        //可申请
        mayApply: 'mayapply',
        //已获取
        alreadyObtain: 'obtained',
        //查看全部
        seeMore: 'View all',
        //暂无可申请证书
        noApplicationCertificate: 'No application for a certificate',
        //暂无证书
        noCertificate: 'No certificate',
        //暂无证书分类
        noClassification: 'No certificate of classification'
    },
    //证书申请页：templates/certificate/apply.ftl
    apply: {
        //证书申请
        certificateApplication: 'Certificate Application',
        //基本信息
        basicInformation: 'Basic information',
        //姓名：
        name: 'Name:',
        //请输入姓名
        inputName: 'Please enter your name',
        //身份证号：
        idNumber: ' ID card:',
        //请输入正确的身份证号码
        inputIdNumber: 'Please enter the correct ID number',
        //上传照片：
        photos: 'Photos:',
        //上传照片
        uploadPhotos: 'Upload photos',
        //请选择本地照片上传
        uploadLocalPhotos: 'Choose local photo',
        //地址信息
        addressInformation: 'Address information',
        //收货人：
        consignee: 'Consignee:',
        //请输入收货人
        inputConsignee: 'Please enter the receiver',
        //手机号码：
        phoneNumber: 'Tel:',
        //请输入正确的的手机号码
        inputPhoneNumber: 'Please enter the correct mobile phone number',
        //所在区域：
        region: 'Region: ',
        //请选择所在区域?
        choseRegion: 'Please select your area',
        //详细地址：
        detailedAddress: 'Street:',
        //请输入详细地址?
        inputDetailAddress: 'Please enter the detailed address',
        //确认申请
        submitApplication: 'Submit',
        //友情提示
        friendshipTips: 'Friendship tips',
        //姓名字数不能超过20个字符
        nameLimit: 'Name cannot be more than 20 characters',
        //请输入身份证号
        inputIDCard: 'Please enter your ID number',
        //请选择照片
        choosePhoto: 'Please select photos',
        //收货人字数不能超过30个字符
        receiverLimit: 'The receiver shall not exceed 30 characters',
        //请输入手机号码
        inputPhoneNum: 'Please enter your cell phone number',
        //详细地址字数不能超过150个字符
        addressLimit: 'The detailed address shall not exceed 150 characters'
    },
    mine: {
        //点击加载更多证书
        showMore: 'Show more',
        //已获取
        got: 'Obtained',
        //申请中
        applying: 'Applying',
        //暂无证书
        noCertificate: 'No certificate'
    }
};