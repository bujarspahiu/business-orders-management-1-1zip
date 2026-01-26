import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'sq' | 'en';

interface Translations {
  // Header
  header: {
    products: string;
    about: string;
    contact: string;
    adminPanel: string;
    dashboard: string;
    logout: string;
    businessLogin: string;
    login: string;
  };
  // Hero
  hero: {
    badge: string;
    headline: string;
    headlineHighlight: string;
    subheadline: string;
    exploreProducts: string;
    qualityGuaranteed: string;
    isoCertified: string;
    fastDelivery: string;
    nationwide: string;
    b2bPricing: string;
    wholesaleRates: string;
  };
  // Footer
  footer: {
    tagline: string;
    products: string;
    summerTires: string;
    winterTires: string;
    allSeasonTires: string;
    suvTires: string;
    commercialTires: string;
    company: string;
    aboutUs: string;
    ourTechnology: string;
    qualityStandards: string;
    sustainability: string;
    careers: string;
    support: string;
    contactUs: string;
    b2bPortal: string;
    tireGuide: string;
    faq: string;
    warranty: string;
    legal: string;
    privacyPolicy: string;
    termsOfService: string;
    cookiePolicy: string;
    gdpr: string;
    certifiedIso: string;
    qualityManagement: string;
    etrma: string;
    allRightsReserved: string;
    brand: string;
  };
  // About
  about: {
    badge: string;
    title: string;
    description1: string;
    description2: string;
    tuvCertified: string;
    qualitySafety: string;
    benefits: string[];
  };
  // Contact
  contact: {
    badge: string;
    title: string;
    description: string;
    email: string;
    phone: string;
    workingHours: string;
    headquarters: string;
    formTitle: string;
    fullName: string;
    emailAddress: string;
    companyName: string;
    phoneNumber: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    thankYou: string;
    successMessage: string;
    tagline: string;
  };
  // ProductShowcase
  productShowcase: {
    badge: string;
    title: string;
    description: string;
    summerTires: string;
    summerDescription: string;
    winterTires: string;
    winterDescription: string;
    allSeasonTires: string;
    allSeasonDescription: string;
    vehicleTypesTitle: string;
    passengerCars: string;
    suv4x4: string;
    commercialVehicles: string;
    models: string;
  };
  // LoginModal
  loginModal: {
    title: string;
    emailAddress: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    loginButton: string;
    loggingIn: string;
    noAccount: string;
    contactUs: string;
    demoCredentials: string;
    admin: string;
    user: string;
    loginFailed: string;
  };
  // AdminDashboard
  adminDashboard: {
    mainPanel: string;
    users: string;
    products: string;
    orders: string;
    notifications: string;
    adminPanel: string;
    totalUsers: string;
    totalProducts: string;
    totalOrders: string;
    totalRevenue: string;
    quickActions: string;
    manageUsers: string;
    addEditUsers: string;
    manageProducts: string;
    updateInventory: string;
    viewOrders: string;
    processOrders: string;
    notificationSettings: string;
    emailSettings: string;
    alerts: string;
    pendingOrders: string;
    requireAttention: string;
    lowStockItems: string;
    stockBelow: string;
    allSystemsNormal: string;
    noAlerts: string;
    pending: string;
  };
  // OrderManagement
  orderManagement: {
    searchPlaceholder: string;
    allStatuses: string;
    allTime: string;
    today: string;
    last7Days: string;
    last30Days: string;
    lastYear: string;
    noOrdersFound: string;
    items: string;
    customerInfo: string;
    business: string;
    businessNumber: string;
    contactPerson: string;
    email: string;
    phone: string;
    updateStatus: string;
    orderItems: string;
    product: string;
    quantity: string;
    unitPrice: string;
    total: string;
    orderNotes: string;
    downloadPO: string;
    deleteOrder: string;
    deleteConfirmTitle: string;
    deleteConfirmMessage: string;
    cancel: string;
    delete: string;
    // Statuses
    statusPending: string;
    statusConfirmed: string;
    statusProcessing: string;
    statusShipped: string;
    statusDelivered: string;
    statusCancelled: string;
  };
  // ProductManagement
  productManagement: {
    searchPlaceholder: string;
    bulkImport: string;
    addProduct: string;
    product: string;
    dimensions: string;
    type: string;
    season: string;
    stock: string;
    price: string;
    status: string;
    actions: string;
    noProductsFound: string;
    editProduct: string;
    addNewProduct: string;
    productCode: string;
    brand: string;
    name: string;
    width: string;
    aspectRatio: string;
    diameter: string;
    tireType: string;
    stockQuantity: string;
    imageUrl: string;
    description: string;
    activeProduct: string;
    cancel: string;
    updateProduct: string;
    createProduct: string;
    passengerCar: string;
    suv4x4: string;
    vanCommercial: string;
    truck: string;
    summer: string;
    winter: string;
    allSeason: string;
    active: string;
    inactive: string;
    edit: string;
    deleteConfirm: string;
  };
  // UserManagement
  userManagement: {
    searchPlaceholder: string;
    addUser: string;
    user: string;
    business: string;
    contact: string;
    role: string;
    status: string;
    actions: string;
    noUsersFound: string;
    editUser: string;
    addNewUser: string;
    email: string;
    password: string;
    businessName: string;
    businessNumber: string;
    contactPerson: string;
    phone: string;
    whatsapp: string;
    viber: string;
    activeAccount: string;
    cancel: string;
    updateUser: string;
    createUser: string;
    admin: string;
    userRole: string;
    active: string;
    inactive: string;
    edit: string;
    resetPassword: string;
    disable: string;
    enable: string;
    deleteConfirm: string;
    newPassword: string;
    resetPasswordDescription: string;
    passwordRequired: string;
    passwordUpdated: string;
    failedToSave: string;
    failedToReset: string;
  };
  // NotificationSettings
  notificationSettings: {
    title: string;
    description: string;
    recipients: string;
    addRecipient: string;
    noRecipients: string;
    addRecipientsHint: string;
    active: string;
    inactive: string;
    notificationTypes: string;
    adminRole: string;
    adminDescription: string;
    warehouseRole: string;
    warehouseDescription: string;
    financeRole: string;
    financeDescription: string;
    managerRole: string;
    managerDescription: string;
    emailAddress: string;
    name: string;
    nameOptional: string;
    role: string;
    cancel: string;
    add: string;
    removeConfirm: string;
    failedToAdd: string;
  };
  // UserDashboard
  userDashboard: {
    welcome: string;
    products: string;
    orders: string;
    profile: string;
    orderHistory: string;
    noOrders: string;
    orderHistoryHint: string;
    downloadPO: string;
    moreItems: string;
  };
  // CartDrawer
  cartDrawer: {
    cart: string;
    emptyCart: string;
    addProductsHint: string;
    subtotal: string;
    items: string;
    shipping: string;
    calculatedAtCheckout: string;
    total: string;
    proceedToCheckout: string;
    continueShopping: string;
    each: string;
    cantAddMore: string;
  };
  // CheckoutModal
  checkoutModal: {
    title: string;
    businessInfo: string;
    businessName: string;
    businessNumber: string;
    contactPerson: string;
    phone: string;
    orderSummary: string;
    product: string;
    quantity: string;
    price: string;
    total: string;
    grandTotal: string;
    orderNotes: string;
    orderNotesPlaceholder: string;
    purchaseOrder: string;
    purchaseOrderHint: string;
    placeOrder: string;
    processing: string;
    stockError: string;
    insufficientStock: string;
    available: string;
    orderFailed: string;
  };
  // ProductGrid
  productGrid: {
    searchPlaceholder: string;
    allSeasons: string;
    summer: string;
    winter: string;
    allSeason: string;
    allTypes: string;
    passengerCar: string;
    suv4x4: string;
    vanCommercial: string;
    truck: string;
    sortByName: string;
    priceLowHigh: string;
    priceHighLow: string;
    productsFound: string;
    filtersApplied: string;
    perTire: string;
    add: string;
    added: string;
    noProductsFound: string;
    clearFilters: string;
    cantAddMore: string;
  };
  // UserProfile
  userProfile: {
    yourBusiness: string;
    profileUpdated: string;
    businessInfo: string;
    edit: string;
    cancel: string;
    save: string;
    businessName: string;
    businessNumber: string;
    contactPerson: string;
    phone: string;
    whatsapp: string;
    viber: string;
    accountInfo: string;
    emailAddress: string;
    accountStatus: string;
    active: string;
    inactive: string;
    memberSince: string;
    updateFailed: string;
  };
  // OrderConfirmation
  orderConfirmation: {
    success: string;
    thankYou: string;
    orderNumber: string;
    downloadPO: string;
    generatingPDF: string;
    purchaseOrder: string;
    purchaseOrderHint: string;
    emailConfirmation: string;
    emailConfirmationHint: string;
    nextSteps: string;
    step1: string;
    step2: string;
    step3: string;
    continueShopping: string;
    downloadFailed: string;
  };
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    na: string;
  };
}

const translations: Record<Language, Translations> = {
  sq: {
    header: {
      products: 'Produktet',
      about: 'Rreth Nesh',
      contact: 'Kontakti',
      adminPanel: 'Paneli Admin',
      dashboard: 'Paneli',
      logout: 'Dilni',
      businessLogin: 'Hyrje Biznesi',
      login: 'Hyrje',
    },
    hero: {
      badge: 'Cilësi e Certifikuar TÜV',
      headline: 'Zgjidhje Profesionale të Gomave për',
      headlineHighlight: 'Biznesin Tuaj',
      subheadline: 'Bashkëpunoni me Lassa Tyres për goma me cilësi premium me çmime shumice. Porosi të thjeshtëzuara B2B, disponueshmëri në kohë reale, dhe mbështetje e dedikuar për bizneset automobilistike.',
      exploreProducts: 'Eksploro Produktet',
      qualityGuaranteed: 'Cilësi e Garantuar',
      isoCertified: 'Certifikuar ISO',
      fastDelivery: 'Dërgim i Shpejtë',
      nationwide: 'Në të gjithë vendin',
      b2bPricing: 'Çmime B2B',
      wholesaleRates: 'Tarifa Shumice',
    },
    footer: {
      tagline: 'Së bashku në çdo kilometër. Goma me cilësi premium për të gjitha nevojat tuaja të vozitjes.',
      products: 'Produktet',
      summerTires: 'Goma Vere',
      winterTires: 'Goma Dimri',
      allSeasonTires: 'Goma Katër Stinë',
      suvTires: 'Goma SUV & 4x4',
      commercialTires: 'Goma Komerciale',
      company: 'Kompania',
      aboutUs: 'Rreth Nesh',
      ourTechnology: 'Teknologjia Jonë',
      qualityStandards: 'Standardet e Cilësisë',
      sustainability: 'Qëndrueshmëria',
      careers: 'Karriera',
      support: 'Mbështetja',
      contactUs: 'Na Kontaktoni',
      b2bPortal: 'Portali B2B',
      tireGuide: 'Udhëzues Gomash',
      faq: 'Pyetje të Shpeshta',
      warranty: 'Garancia',
      legal: 'Ligjore',
      privacyPolicy: 'Politika e Privatësisë',
      termsOfService: 'Kushtet e Shërbimit',
      cookiePolicy: 'Politika e Cookies',
      gdpr: 'GDPR',
      certifiedIso: 'Certifikuar ISO 9001:2015',
      qualityManagement: 'Sistemi i Menaxhimit të Cilësisë',
      etrma: 'Anëtar i ETRMA (Shoqata Evropiane e Prodhuesve të Gomave dhe Gomës)',
      allRightsReserved: 'Të gjitha të drejtat e rezervuara.',
      brand: 'Një markë e Brisa Bridgestone Sabanci',
    },
    about: {
      badge: 'Rreth Lassa Tyres',
      title: 'Së Bashku në Çdo Kilometër',
      description1: 'Lassa Tyres, një markë e Brisa, është një nga prodhuesit kryesorë të gomave në Evropë. Me një trashëgimi që shtrihet mbi katër dekada, ne kombinojmë zejtarinë tradicionale me teknologjinë më të fundit për të ofruar goma që përmbushin standardet më të larta të cilësisë dhe performancës.',
      description2: 'Angazhimi ynë ndaj inovacionit dhe përsosmërisë na ka bërë një partner të besuar për bizneset automobilistike në mbarë botën. Nga veturat e pasagjerëve te automjetet komerciale, gama jonë gjithëpërfshirëse e gomave është projektuar për të ofruar performancë superiore në të gjitha kushtet.',
      tuvCertified: 'Certifikuar TÜV',
      qualitySafety: 'Standarde Cilësie & Sigurie',
      benefits: [
        'Mbi 45 vjet përvojë në prodhimin e gomave',
        'Objekte prodhimi me teknologji të avancuar',
        'Kontroll rigoroz i cilësisë dhe testim',
        'Prodhim i përgjegjshëm ndaj mjedisit',
        'Investim i vazhdueshëm në R&D',
        'Rrjet global i shpërndarjes',
      ],
    },
    contact: {
      badge: 'Na Kontaktoni',
      title: 'Gati për të Bashkëpunuar me Ne?',
      description: 'Jeni të interesuar të bëheni partner biznesi i Lassa Tyres? Kontaktoni ekipin tonë B2B për të mësuar rreth çmimeve shumice, hapjes së llogarisë, dhe si mund të mbështesim rritjen e biznesit tuaj.',
      email: 'Email',
      phone: 'Telefon',
      workingHours: 'E Hënë - E Premte 9:00 - 18:00',
      headquarters: 'Selia Qendrore',
      formTitle: 'Kërkoni Llogari Biznesi',
      fullName: 'Emri i Plotë *',
      emailAddress: 'Adresa Email *',
      companyName: 'Emri i Kompanisë *',
      phoneNumber: 'Numri i Telefonit',
      message: 'Mesazhi',
      messagePlaceholder: 'Na tregoni për biznesin tuaj dhe nevojat për goma...',
      submit: 'Dërgo Kërkesën',
      submitting: 'Duke dërguar...',
      thankYou: 'Faleminderit!',
      successMessage: 'Kemi marrë kërkesën tuaj dhe do t\'ju kontaktojmë brenda 24 orëve.',
      tagline: 'Së bashku në çdo kilometër',
    },
    productShowcase: {
      badge: 'Gama Jonë e Produkteve',
      title: 'Goma Premium për Çdo Nevojë',
      description: 'Nga performanca verore te siguria dimërore, ne ofrojmë një gamë të plotë gomash me cilësi të lartë për të gjitha llojet e automjeteve dhe kushtet e vozitjes.',
      summerTires: 'Goma Vere',
      summerDescription: 'Performancë optimale në kushte të ngrohta me aderencë të shkëlqyer dhe efikasitet karburanti',
      winterTires: 'Goma Dimri',
      winterDescription: 'Tërheqje superiore në borë dhe akull me teknologji të avancuar të përbërjes',
      allSeasonTires: 'Goma Katër Stinë',
      allSeasonDescription: 'Shkathtësi gjatë gjithë vitit me performancë të balancuar në të gjitha kushtet',
      vehicleTypesTitle: 'Goma për të Gjitha Llojet e Automjeteve',
      passengerCars: 'Vetura Pasagjerësh',
      suv4x4: 'SUV & 4x4',
      commercialVehicles: 'Automjete Komerciale',
      models: 'Modele',
    },
    loginModal: {
      title: 'Hyrje Biznesi',
      emailAddress: 'Adresa Email',
      emailPlaceholder: 'email@juaj.com',
      password: 'Fjalëkalimi',
      passwordPlaceholder: 'Vendosni fjalëkalimin tuaj',
      loginButton: 'Hyni',
      loggingIn: 'Duke hyrë...',
      noAccount: 'Nuk keni llogari biznesi?',
      contactUs: 'Na kontaktoni',
      demoCredentials: 'Kredencialet Demo:',
      admin: 'Admin',
      user: 'Përdorues',
      loginFailed: 'Hyrja dështoi',
    },
    adminDashboard: {
      mainPanel: 'Paneli Kryesor',
      users: 'Përdoruesit',
      products: 'Produktet',
      orders: 'Porositë',
      notifications: 'Njoftimet',
      adminPanel: 'Paneli i Administratorit',
      totalUsers: 'Totali Përdoruesve',
      totalProducts: 'Totali Produkteve',
      totalOrders: 'Totali Porosive',
      totalRevenue: 'Të Ardhurat Totale',
      quickActions: 'Veprime të Shpejta',
      manageUsers: 'Menaxho Përdoruesit',
      addEditUsers: 'Shto ose ndrysho përdorues',
      manageProducts: 'Menaxho Produktet',
      updateInventory: 'Përditëso inventarin',
      viewOrders: 'Shiko Porositë',
      processOrders: 'Përpuno porositë',
      notificationSettings: 'Njoftimet',
      emailSettings: 'Cilësimet e email-it',
      alerts: 'Alarmet',
      pendingOrders: 'Porosi në Pritje',
      requireAttention: 'Kërkojnë vëmendje',
      lowStockItems: 'Artikuj me Stok të Ulët',
      stockBelow: 'Stoku nën 20 njësi',
      allSystemsNormal: 'Të Gjitha Sistemet Normale',
      noAlerts: 'Nuk ka alarme në këtë moment',
      pending: 'në pritje',
    },
    orderManagement: {
      searchPlaceholder: 'Kërko sipas numrit të porosisë, email, ose biznesit...',
      allStatuses: 'Të gjitha statuset',
      allTime: 'Të gjitha kohët',
      today: 'Sot',
      last7Days: '7 ditët e fundit',
      last30Days: '30 ditët e fundit',
      lastYear: 'Vitin e fundit',
      noOrdersFound: 'Nuk u gjetën porosi',
      items: 'artikuj',
      customerInfo: 'Informacioni i Klientit',
      business: 'Biznesi',
      businessNumber: 'Nr. Biznesit',
      contactPerson: 'Personi i kontaktit',
      email: 'Email',
      phone: 'Telefon',
      updateStatus: 'Përditëso Statusin',
      orderItems: 'Artikujt e Porosisë',
      product: 'Produkti',
      quantity: 'Sasia',
      unitPrice: 'Çmimi për njësi',
      total: 'Totali',
      orderNotes: 'Shënime të Porosisë',
      downloadPO: 'Shkarko PO',
      deleteOrder: 'Fshi Porosinë',
      deleteConfirmTitle: 'Jeni të sigurt që dëshironi të fshini këtë porosi?',
      deleteConfirmMessage: 'Kjo veprim nuk mund të zhbëhet. Porosia do të fshihet përgjithmonë.',
      cancel: 'Anulo',
      delete: 'Fshi Porosinë',
      statusPending: 'Në pritje',
      statusConfirmed: 'Konfirmuar',
      statusProcessing: 'Në përpunim',
      statusShipped: 'Dërguar',
      statusDelivered: 'Dorëzuar',
      statusCancelled: 'Anuluar',
    },
    productManagement: {
      searchPlaceholder: 'Kërko produkte...',
      bulkImport: 'Import Masiv',
      addProduct: 'Shto Produkt',
      product: 'Produkti',
      dimensions: 'Dimensionet',
      type: 'Lloji',
      season: 'Stina',
      stock: 'Stoku',
      price: 'Çmimi',
      status: 'Statusi',
      actions: 'Veprime',
      noProductsFound: 'Nuk u gjetën produkte',
      editProduct: 'Ndrysho Produktin',
      addNewProduct: 'Shto Produkt të Ri',
      productCode: 'Kodi i Produktit *',
      brand: 'Marka *',
      name: 'Emri *',
      width: 'Gjerësia',
      aspectRatio: 'Raporti',
      diameter: 'Diametri',
      tireType: 'Lloji i Gomës',
      stockQuantity: 'Sasia në Stok *',
      imageUrl: 'URL e Imazhit',
      description: 'Përshkrimi',
      activeProduct: 'Produkt Aktiv',
      cancel: 'Anulo',
      updateProduct: 'Përditëso Produktin',
      createProduct: 'Krijo Produktin',
      passengerCar: 'Veturë Pasagjerësh',
      suv4x4: 'SUV / 4x4',
      vanCommercial: 'Furgon / Komercial',
      truck: 'Kamion',
      summer: 'Verë',
      winter: 'Dimër',
      allSeason: 'Katër Stinë',
      active: 'Aktiv',
      inactive: 'Joaktiv',
      edit: 'Ndrysho',
      deleteConfirm: 'Jeni të sigurt që dëshironi të fshini këtë produkt?',
    },
    userManagement: {
      searchPlaceholder: 'Kërko përdorues...',
      addUser: 'Shto Përdorues',
      user: 'Përdoruesi',
      business: 'Biznesi',
      contact: 'Kontakti',
      role: 'Roli',
      status: 'Statusi',
      actions: 'Veprime',
      noUsersFound: 'Nuk u gjetën përdorues',
      editUser: 'Ndrysho Përdoruesin',
      addNewUser: 'Shto Përdorues të Ri',
      email: 'Email *',
      password: 'Fjalëkalimi *',
      businessName: 'Emri i Biznesit',
      businessNumber: 'Numri i Biznesit',
      contactPerson: 'Personi i Kontaktit',
      phone: 'Telefon',
      whatsapp: 'WhatsApp',
      viber: 'Viber',
      activeAccount: 'Llogari Aktive',
      cancel: 'Anulo',
      updateUser: 'Përditëso Përdoruesin',
      createUser: 'Krijo Përdoruesin',
      admin: 'Admin',
      userRole: 'Përdorues',
      active: 'Aktiv',
      inactive: 'Joaktiv',
      edit: 'Ndrysho',
      resetPassword: 'Rivendos Fjalëkalimin',
      disable: 'Çaktivizo',
      enable: 'Aktivizo',
      deleteConfirm: 'Jeni të sigurt që dëshironi të fshini këtë përdorues?',
      newPassword: 'Fjalëkalimi i Ri',
      resetPasswordDescription: 'Vendosni një fjalëkalim të ri për këtë përdorues. Fjalëkalimi do të përditësohet menjëherë.',
      passwordRequired: 'Fjalëkalimi kërkohet për përdorues të rinj',
      passwordUpdated: 'Fjalëkalimi u përditësua me sukses',
      failedToSave: 'Dështoi ruajtja e përdoruesit',
      failedToReset: 'Dështoi rivendosja e fjalëkalimit',
    },
    notificationSettings: {
      title: 'Njoftimet me Email',
      description: 'Konfiguroni marrësit e email-it për njoftimet e porosive. Çdo marrës do të marrë email kur vendosen porosi të reja bazuar në rolin e tyre.',
      recipients: 'Marrësit e Njoftime',
      addRecipient: 'Shto Marrës',
      noRecipients: 'Nuk ka marrës të konfiguruar',
      addRecipientsHint: 'Shtoni marrës për të marrë njoftimet e porosive',
      active: 'Aktiv',
      inactive: 'Joaktiv',
      notificationTypes: 'Llojet e Njoftime sipas Rolit',
      adminRole: 'Admin',
      adminDescription: 'Merr të gjitha njoftimet e porosive dhe alarmet e sistemit',
      warehouseRole: 'Magazina',
      warehouseDescription: 'Merr njoftimet për përmbushjen e porosive dhe dërgesën',
      financeRole: 'Financa',
      financeDescription: 'Merr konfirmimet e porosive dhe njoftimet e pagesave',
      managerRole: 'Menaxher',
      managerDescription: 'Merr përmbledhjet ditore/javore të porosive dhe raportet',
      emailAddress: 'Adresa Email *',
      name: 'Emri',
      nameOptional: 'Emri (Opsional)',
      role: 'Roli',
      cancel: 'Anulo',
      add: 'Shto Marrës',
      removeConfirm: 'Jeni të sigurt që dëshironi të hiqni këtë marrës?',
      failedToAdd: 'Dështoi shtimi i marrësit',
    },
    userDashboard: {
      welcome: 'Mirë se vini,',
      products: 'Produktet',
      orders: 'Porositë',
      profile: 'Profili',
      orderHistory: 'Historia e Porosive',
      noOrders: 'Ende nuk keni porosi',
      orderHistoryHint: 'Historia e porosive tuaja do të shfaqet këtu',
      downloadPO: 'Shkarko PO',
      moreItems: 'artikuj të tjerë',
    },
    cartDrawer: {
      cart: 'Shporta',
      emptyCart: 'Shporta juaj është bosh',
      addProductsHint: 'Shtoni produkte në shportë për të bërë porosi',
      subtotal: 'Nëntotali',
      items: 'artikuj',
      shipping: 'Transporti',
      calculatedAtCheckout: 'Llogaritet në arkë',
      total: 'Totali',
      proceedToCheckout: 'Vazhdo në Arkë',
      continueShopping: 'Vazhdo Blerjen',
      each: 'secila',
      cantAddMore: 'Nuk mund të shtoni më shumë artikuj se sa ka në stok',
    },
    checkoutModal: {
      title: 'Përfundoni Porosinë Tuaj',
      businessInfo: 'Informacioni i Biznesit',
      businessName: 'Emri i Biznesit',
      businessNumber: 'Numri i Biznesit',
      contactPerson: 'Personi i Kontaktit',
      phone: 'Telefon',
      orderSummary: 'Përmbledhja e Porosisë',
      product: 'Produkti',
      quantity: 'Sasia',
      price: 'Çmimi',
      total: 'Totali',
      grandTotal: 'Shuma Totale:',
      orderNotes: 'Shënime të Porosisë (Opsionale)',
      orderNotesPlaceholder: 'Shtoni ndonjë udhëzim special ose shënim për këtë porosi...',
      purchaseOrder: 'Porosia e Blerjes',
      purchaseOrderHint: 'Një porosi blerje do të gjenerohet për këtë porosi. Do të merrni një kopje përmes email-it.',
      placeOrder: 'Bëj Porosinë',
      processing: 'Duke përpunuar porosinë...',
      stockError: 'Gabim gjatë kontrollit të stokut për',
      insufficientStock: 'Stok i pamjaftueshëm për',
      available: 'Në dispozicion',
      orderFailed: 'Dështoi dërgimi i porosisë. Ju lutem provoni përsëri.',
    },
    productGrid: {
      searchPlaceholder: 'Kërko sipas emrit, kodit, ose dimensioneve...',
      allSeasons: 'Të gjitha stinët',
      summer: 'Verë',
      winter: 'Dimër',
      allSeason: 'Katër Stinë',
      allTypes: 'Të gjitha llojet',
      passengerCar: 'Vetura Pasagjerësh',
      suv4x4: 'SUV / 4x4',
      vanCommercial: 'Furgon / Komercial',
      truck: 'Kamion',
      sortByName: 'Rendit sipas Emrit',
      priceLowHigh: 'Çmimi: Ulët në Lartë',
      priceHighLow: 'Çmimi: Lartë në Ulët',
      productsFound: 'produkte u gjetën',
      filtersApplied: 'Filtra të aplikuara:',
      perTire: 'për gomë',
      add: 'Shto',
      added: 'Shtuar',
      noProductsFound: 'Nuk u gjetën produkte që përputhen me kriteret tuaja.',
      clearFilters: 'Pastro të gjitha filtrat',
      cantAddMore: 'Nuk mund të shtoni më shumë artikuj se sa ka në stok',
    },
    userProfile: {
      yourBusiness: 'Biznesi Juaj',
      profileUpdated: 'Profili u përditësua me sukses!',
      businessInfo: 'Informacioni i Biznesit',
      edit: 'Ndrysho',
      cancel: 'Anulo',
      save: 'Ruaj',
      businessName: 'Emri i Biznesit',
      businessNumber: 'Numri i Biznesit',
      contactPerson: 'Personi i Kontaktit',
      phone: 'Numri i Telefonit',
      whatsapp: 'WhatsApp',
      viber: 'Viber',
      accountInfo: 'Informacioni i Llogarisë',
      emailAddress: 'Adresa Email',
      accountStatus: 'Statusi i Llogarisë',
      active: 'Aktiv',
      inactive: 'Joaktiv',
      memberSince: 'Anëtar që nga',
      updateFailed: 'Dështoi përditësimi i profilit',
    },
    orderConfirmation: {
      success: 'Porosia u Vendos me Sukses!',
      thankYou: 'Faleminderit për porosinë tuaj. Porosia juaj e blerjes është gjeneruar.',
      orderNumber: 'Numri i Porosisë',
      downloadPO: 'Shkarko Porosinë e Blerjes (PDF)',
      generatingPDF: 'Duke gjeneruar PDF...',
      purchaseOrder: 'Porosia e Blerjes',
      purchaseOrderHint: 'Shkarkoni PO-në tuaj më sipër ose aksesojeni në çdo kohë nga historia e porosive.',
      emailConfirmation: 'Konfirmimi me Email',
      emailConfirmationHint: 'Do të merrni një email konfirmimi me detajet e porosisë së shpejti.',
      nextSteps: 'Hapat e Ardhshëm?',
      step1: 'Ekipi ynë do të shqyrtojë dhe konfirmojë porosinë tuaj',
      step2: 'Do të merrni një email konfirmimi me detajet e dërgesës',
      step3: 'Ndiqni statusin e porosisë tuaj në panelin tuaj',
      continueShopping: 'Vazhdo Blerjen',
      downloadFailed: 'Dështoi shkarkimi i PDF. Ju lutem provoni përsëri.',
    },
    common: {
      loading: 'Duke ngarkuar...',
      error: 'Gabim',
      success: 'Sukses',
      save: 'Ruaj',
      cancel: 'Anulo',
      delete: 'Fshi',
      edit: 'Ndrysho',
      close: 'Mbyll',
      confirm: 'Konfirmo',
      yes: 'Po',
      no: 'Jo',
      na: 'N/A',
    },
  },
  en: {
    header: {
      products: 'Products',
      about: 'About Us',
      contact: 'Contact',
      adminPanel: 'Admin Panel',
      dashboard: 'Dashboard',
      logout: 'Logout',
      businessLogin: 'Business Login',
      login: 'Login',
    },
    hero: {
      badge: 'TÜV Certified Quality',
      headline: 'Professional Tire Solutions for',
      headlineHighlight: 'Your Business',
      subheadline: 'Partner with Lassa Tyres for premium quality tires at wholesale prices. Streamlined B2B ordering, real-time availability, and dedicated support for automotive businesses.',
      exploreProducts: 'Explore Products',
      qualityGuaranteed: 'Quality Guaranteed',
      isoCertified: 'ISO Certified',
      fastDelivery: 'Fast Delivery',
      nationwide: 'Nationwide',
      b2bPricing: 'B2B Pricing',
      wholesaleRates: 'Wholesale Rates',
    },
    footer: {
      tagline: 'Together on every mile. Premium quality tires for all your driving needs.',
      products: 'Products',
      summerTires: 'Summer Tires',
      winterTires: 'Winter Tires',
      allSeasonTires: 'All-Season Tires',
      suvTires: 'SUV & 4x4 Tires',
      commercialTires: 'Commercial Tires',
      company: 'Company',
      aboutUs: 'About Us',
      ourTechnology: 'Our Technology',
      qualityStandards: 'Quality Standards',
      sustainability: 'Sustainability',
      careers: 'Careers',
      support: 'Support',
      contactUs: 'Contact Us',
      b2bPortal: 'B2B Portal',
      tireGuide: 'Tire Guide',
      faq: 'FAQ',
      warranty: 'Warranty',
      legal: 'Legal',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      cookiePolicy: 'Cookie Policy',
      gdpr: 'GDPR',
      certifiedIso: 'ISO 9001:2015 Certified',
      qualityManagement: 'Quality Management System',
      etrma: 'Member of ETRMA (European Tyre and Rubber Manufacturers\' Association)',
      allRightsReserved: 'All rights reserved.',
      brand: 'A brand of Brisa Bridgestone Sabanci',
    },
    about: {
      badge: 'About Lassa Tyres',
      title: 'Together on Every Mile',
      description1: 'Lassa Tyres, a brand of Brisa, is one of the leading tire manufacturers in Europe. With a heritage spanning over four decades, we combine traditional craftsmanship with cutting-edge technology to deliver tires that meet the highest standards of quality and performance.',
      description2: 'Our commitment to innovation and excellence has made us a trusted partner for automotive businesses worldwide. From passenger cars to commercial vehicles, our comprehensive tire range is designed to deliver superior performance in all conditions.',
      tuvCertified: 'TÜV Certified',
      qualitySafety: 'Quality & Safety Standards',
      benefits: [
        'Over 45 years of tire manufacturing experience',
        'State-of-the-art production facilities',
        'Rigorous quality control and testing',
        'Environmentally responsible production',
        'Continuous R&D investment',
        'Global distribution network',
      ],
    },
    contact: {
      badge: 'Contact Us',
      title: 'Ready to Partner with Us?',
      description: 'Interested in becoming a Lassa Tyres business partner? Contact our B2B team to learn about wholesale pricing, account setup, and how we can support your business growth.',
      email: 'Email',
      phone: 'Phone',
      workingHours: 'Monday - Friday 9:00 AM - 6:00 PM',
      headquarters: 'Headquarters',
      formTitle: 'Request Business Account',
      fullName: 'Full Name *',
      emailAddress: 'Email Address *',
      companyName: 'Company Name *',
      phoneNumber: 'Phone Number',
      message: 'Message',
      messagePlaceholder: 'Tell us about your business and tire needs...',
      submit: 'Submit Request',
      submitting: 'Submitting...',
      thankYou: 'Thank You!',
      successMessage: 'We have received your request and will contact you within 24 hours.',
      tagline: 'Together on every mile',
    },
    productShowcase: {
      badge: 'Our Product Range',
      title: 'Premium Tires for Every Need',
      description: 'From summer performance to winter safety, we offer a complete range of high-quality tires for all vehicle types and driving conditions.',
      summerTires: 'Summer Tires',
      summerDescription: 'Optimal performance in warm conditions with excellent grip and fuel efficiency',
      winterTires: 'Winter Tires',
      winterDescription: 'Superior traction in snow and ice with advanced compound technology',
      allSeasonTires: 'All-Season Tires',
      allSeasonDescription: 'Year-round versatility with balanced performance in all conditions',
      vehicleTypesTitle: 'Tires for All Vehicle Types',
      passengerCars: 'Passenger Cars',
      suv4x4: 'SUV & 4x4',
      commercialVehicles: 'Commercial Vehicles',
      models: 'Models',
    },
    loginModal: {
      title: 'Business Login',
      emailAddress: 'Email Address',
      emailPlaceholder: 'your@email.com',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      loginButton: 'Login',
      loggingIn: 'Logging in...',
      noAccount: 'Don\'t have a business account?',
      contactUs: 'Contact us',
      demoCredentials: 'Demo Credentials:',
      admin: 'Admin',
      user: 'User',
      loginFailed: 'Login failed',
    },
    adminDashboard: {
      mainPanel: 'Main Dashboard',
      users: 'Users',
      products: 'Products',
      orders: 'Orders',
      notifications: 'Notifications',
      adminPanel: 'Admin Panel',
      totalUsers: 'Total Users',
      totalProducts: 'Total Products',
      totalOrders: 'Total Orders',
      totalRevenue: 'Total Revenue',
      quickActions: 'Quick Actions',
      manageUsers: 'Manage Users',
      addEditUsers: 'Add or edit users',
      manageProducts: 'Manage Products',
      updateInventory: 'Update inventory',
      viewOrders: 'View Orders',
      processOrders: 'Process orders',
      notificationSettings: 'Notifications',
      emailSettings: 'Email settings',
      alerts: 'Alerts',
      pendingOrders: 'Pending Orders',
      requireAttention: 'Require attention',
      lowStockItems: 'Low Stock Items',
      stockBelow: 'Stock below 20 units',
      allSystemsNormal: 'All Systems Normal',
      noAlerts: 'No alerts at this time',
      pending: 'pending',
    },
    orderManagement: {
      searchPlaceholder: 'Search by order number, email, or business...',
      allStatuses: 'All statuses',
      allTime: 'All time',
      today: 'Today',
      last7Days: 'Last 7 days',
      last30Days: 'Last 30 days',
      lastYear: 'Last year',
      noOrdersFound: 'No orders found',
      items: 'items',
      customerInfo: 'Customer Information',
      business: 'Business',
      businessNumber: 'Business No.',
      contactPerson: 'Contact Person',
      email: 'Email',
      phone: 'Phone',
      updateStatus: 'Update Status',
      orderItems: 'Order Items',
      product: 'Product',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      total: 'Total',
      orderNotes: 'Order Notes',
      downloadPO: 'Download PO',
      deleteOrder: 'Delete Order',
      deleteConfirmTitle: 'Are you sure you want to delete this order?',
      deleteConfirmMessage: 'This action cannot be undone. The order will be permanently deleted.',
      cancel: 'Cancel',
      delete: 'Delete Order',
      statusPending: 'Pending',
      statusConfirmed: 'Confirmed',
      statusProcessing: 'Processing',
      statusShipped: 'Shipped',
      statusDelivered: 'Delivered',
      statusCancelled: 'Cancelled',
    },
    productManagement: {
      searchPlaceholder: 'Search products...',
      bulkImport: 'Bulk Import',
      addProduct: 'Add Product',
      product: 'Product',
      dimensions: 'Dimensions',
      type: 'Type',
      season: 'Season',
      stock: 'Stock',
      price: 'Price',
      status: 'Status',
      actions: 'Actions',
      noProductsFound: 'No products found',
      editProduct: 'Edit Product',
      addNewProduct: 'Add New Product',
      productCode: 'Product Code *',
      brand: 'Brand *',
      name: 'Name *',
      width: 'Width',
      aspectRatio: 'Aspect Ratio',
      diameter: 'Diameter',
      tireType: 'Tire Type',
      stockQuantity: 'Stock Quantity *',
      imageUrl: 'Image URL',
      description: 'Description',
      activeProduct: 'Active Product',
      cancel: 'Cancel',
      updateProduct: 'Update Product',
      createProduct: 'Create Product',
      passengerCar: 'Passenger Car',
      suv4x4: 'SUV / 4x4',
      vanCommercial: 'Van / Commercial',
      truck: 'Truck',
      summer: 'Summer',
      winter: 'Winter',
      allSeason: 'All-Season',
      active: 'Active',
      inactive: 'Inactive',
      edit: 'Edit',
      deleteConfirm: 'Are you sure you want to delete this product?',
    },
    userManagement: {
      searchPlaceholder: 'Search users...',
      addUser: 'Add User',
      user: 'User',
      business: 'Business',
      contact: 'Contact',
      role: 'Role',
      status: 'Status',
      actions: 'Actions',
      noUsersFound: 'No users found',
      editUser: 'Edit User',
      addNewUser: 'Add New User',
      email: 'Email *',
      password: 'Password *',
      businessName: 'Business Name',
      businessNumber: 'Business Number',
      contactPerson: 'Contact Person',
      phone: 'Phone',
      whatsapp: 'WhatsApp',
      viber: 'Viber',
      activeAccount: 'Active Account',
      cancel: 'Cancel',
      updateUser: 'Update User',
      createUser: 'Create User',
      admin: 'Admin',
      userRole: 'User',
      active: 'Active',
      inactive: 'Inactive',
      edit: 'Edit',
      resetPassword: 'Reset Password',
      disable: 'Disable',
      enable: 'Enable',
      deleteConfirm: 'Are you sure you want to delete this user?',
      newPassword: 'New Password',
      resetPasswordDescription: 'Enter a new password for this user. The password will be updated immediately.',
      passwordRequired: 'Password is required for new users',
      passwordUpdated: 'Password updated successfully',
      failedToSave: 'Failed to save user',
      failedToReset: 'Failed to reset password',
    },
    notificationSettings: {
      title: 'Email Notifications',
      description: 'Configure email recipients for order notifications. Each recipient will receive emails when new orders are placed based on their role.',
      recipients: 'Notification Recipients',
      addRecipient: 'Add Recipient',
      noRecipients: 'No notification recipients configured',
      addRecipientsHint: 'Add recipients to receive order notifications',
      active: 'Active',
      inactive: 'Inactive',
      notificationTypes: 'Notification Types by Role',
      adminRole: 'Admin',
      adminDescription: 'Receives all order notifications and system alerts',
      warehouseRole: 'Warehouse',
      warehouseDescription: 'Receives notifications for order fulfillment and shipping',
      financeRole: 'Finance',
      financeDescription: 'Receives order confirmations and payment notifications',
      managerRole: 'Manager',
      managerDescription: 'Receives daily/weekly order summaries and reports',
      emailAddress: 'Email Address *',
      name: 'Name',
      nameOptional: 'Name (Optional)',
      role: 'Role',
      cancel: 'Cancel',
      add: 'Add Recipient',
      removeConfirm: 'Are you sure you want to remove this recipient?',
      failedToAdd: 'Failed to add recipient',
    },
    userDashboard: {
      welcome: 'Welcome,',
      products: 'Products',
      orders: 'Orders',
      profile: 'Profile',
      orderHistory: 'Order History',
      noOrders: 'No orders yet',
      orderHistoryHint: 'Your order history will appear here',
      downloadPO: 'Download PO',
      moreItems: 'more items',
    },
    cartDrawer: {
      cart: 'Cart',
      emptyCart: 'Your cart is empty',
      addProductsHint: 'Add products to cart to place an order',
      subtotal: 'Subtotal',
      items: 'items',
      shipping: 'Shipping',
      calculatedAtCheckout: 'Calculated at checkout',
      total: 'Total',
      proceedToCheckout: 'Proceed to Checkout',
      continueShopping: 'Continue Shopping',
      each: 'each',
      cantAddMore: 'Cannot add more items than available in stock',
    },
    checkoutModal: {
      title: 'Complete Your Order',
      businessInfo: 'Business Information',
      businessName: 'Business Name',
      businessNumber: 'Business Number',
      contactPerson: 'Contact Person',
      phone: 'Phone',
      orderSummary: 'Order Summary',
      product: 'Product',
      quantity: 'Quantity',
      price: 'Price',
      total: 'Total',
      grandTotal: 'Grand Total:',
      orderNotes: 'Order Notes (Optional)',
      orderNotesPlaceholder: 'Add any special instructions or notes for this order...',
      purchaseOrder: 'Purchase Order',
      purchaseOrderHint: 'A purchase order will be generated for this order. You will receive a copy via email.',
      placeOrder: 'Place Order',
      processing: 'Processing order...',
      stockError: 'Error checking stock for',
      insufficientStock: 'Insufficient stock for',
      available: 'Available',
      orderFailed: 'Failed to submit order. Please try again.',
    },
    productGrid: {
      searchPlaceholder: 'Search by name, code, or dimensions...',
      allSeasons: 'All seasons',
      summer: 'Summer',
      winter: 'Winter',
      allSeason: 'All-Season',
      allTypes: 'All types',
      passengerCar: 'Passenger Car',
      suv4x4: 'SUV / 4x4',
      vanCommercial: 'Van / Commercial',
      truck: 'Truck',
      sortByName: 'Sort by Name',
      priceLowHigh: 'Price: Low to High',
      priceHighLow: 'Price: High to Low',
      productsFound: 'products found',
      filtersApplied: 'Filters applied:',
      perTire: 'per tire',
      add: 'Add',
      added: 'Added',
      noProductsFound: 'No products found matching your criteria.',
      clearFilters: 'Clear all filters',
      cantAddMore: 'Cannot add more items than available in stock',
    },
    userProfile: {
      yourBusiness: 'Your Business',
      profileUpdated: 'Profile updated successfully!',
      businessInfo: 'Business Information',
      edit: 'Edit',
      cancel: 'Cancel',
      save: 'Save',
      businessName: 'Business Name',
      businessNumber: 'Business Number',
      contactPerson: 'Contact Person',
      phone: 'Phone Number',
      whatsapp: 'WhatsApp',
      viber: 'Viber',
      accountInfo: 'Account Information',
      emailAddress: 'Email Address',
      accountStatus: 'Account Status',
      active: 'Active',
      inactive: 'Inactive',
      memberSince: 'Member Since',
      updateFailed: 'Failed to update profile',
    },
    orderConfirmation: {
      success: 'Order Placed Successfully!',
      thankYou: 'Thank you for your order. Your purchase order has been generated.',
      orderNumber: 'Order Number',
      downloadPO: 'Download Purchase Order (PDF)',
      generatingPDF: 'Generating PDF...',
      purchaseOrder: 'Purchase Order',
      purchaseOrderHint: 'Download your PO above or access it anytime from your order history.',
      emailConfirmation: 'Email Confirmation',
      emailConfirmationHint: 'You will receive a confirmation email with order details shortly.',
      nextSteps: 'What\'s Next?',
      step1: 'Our team will review and confirm your order',
      step2: 'You will receive a confirmation email with shipping details',
      step3: 'Track your order status in your dashboard',
      continueShopping: 'Continue Shopping',
      downloadFailed: 'Failed to download PDF. Please try again.',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      na: 'N/A',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'sq') ? saved : 'sq';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    // Update document language attribute
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
