(function () {
    "use strict";

    const BOLTZMANN_CONSTANT = 1.380649e-23;
    const STORAGE_KEYS = Object.freeze({
        customTelescopes: "snrcalc:v1:custom-telescopes",
        preferences: "snrcalc:v1:preferences"
    });
    const MAX_CUSTOM_TELESCOPES = 20;
    const ALLOWED_POLARISATIONS = Object.freeze([1, 2]);

    const BUILT_IN_TELESCOPES = Object.freeze([
        Object.freeze({
            id: "meerkat-l-64-tied-array",
            telescopeName: "MeerKAT",
            displayName: "MeerKAT L-Band",
            configurationName: "L-band / 64-dish tied array",
            collectingAreaM2: 9802.84,
            efficiencyPercent: 78.9,
            centreFrequencyMHz: 1400,
            bandwidthMHz: 675,
            systemTemperatureK: 18,
            polarisations: 2,
            sourceLabel: "MeerTime system verification",
            sourceUrl: "https://www.cambridge.org/core/journals/publications-of-the-astronomical-society-of-australia/article/meerkat-telescope-as-a-pulsar-facility-system-verification-and-early-science-results-from-meertime/A0ED62920EA3207804981FA721B912DF",
            additionalSources: Object.freeze([
                Object.freeze({
                    label: "MeerKAT telescope geometry and specifications",
                    url: "https://pos.sissa.it/277/001/pdf"
                })
            ]),
            lastVerified: "2026-08-05",
            notes: "Nominal coherent sum of 64 dishes near 1400 MHz. Area and efficiency are combined from the published dish geometry and measured array gain; dish availability, phasing, RFI, elevation and sky position change sensitivity."
        }),
        Object.freeze({
            id: "murriyang-uwl-sb5",
            telescopeName: "Parkes / Murriyang",
            displayName: "Parkes",
            configurationName: "UWL 20-cm sub-band 5",
            collectingAreaM2: 3217,
            efficiencyPercent: 70,
            centreFrequencyMHz: 1408,
            bandwidthMHz: 116.48,
            systemTemperatureK: 27,
            polarisations: 2,
            sourceLabel: "Ultra-wideband low-frequency receiver paper",
            sourceUrl: "https://doi.org/10.1017/pasa.2020.2",
            lastVerified: "2026-08-05",
            notes: "Representative 1344–1472 MHz sub-band with the published useful-band fraction and full-chain system estimate. UWL sensitivity varies strongly across its full 704–4032 MHz range."
        }),
        Object.freeze({
            id: "fast-gpps-l-band",
            telescopeName: "FAST",
            displayName: "FAST",
            configurationName: "GPPS L-band / full gain",
            collectingAreaM2: 70685.83,
            efficiencyPercent: 60,
            centreFrequencyMHz: 1250,
            bandwidthMHz: 450,
            systemTemperatureK: 20,
            polarisations: 2,
            sourceLabel: "FAST Galactic Plane Pulsar Snapshot survey",
            sourceUrl: "https://arxiv.org/abs/2105.08460",
            lastVerified: "2026-08-05",
            notes: "Published full-gain configuration below 26.4 degrees zenith angle: 300 m effective aperture diameter, 60% aperture efficiency, about 20 K system temperature, 450 MHz useful bandwidth and two summed linear polarisations. The GPPS planning table separately quotes Tsys + Tsky at about 25 K; this preset keeps the equation's system-temperature input at the paper's stated 20 K and does not add a sky-temperature correction."
        }),
        Object.freeze({
            id: "chime-pulsar-tied-array",
            telescopeName: "CHIME",
            displayName: "CHIME",
            configurationName: "CHIME/Pulsar tied array / near transit",
            collectingAreaM2: 6400,
            efficiencyPercent: 50,
            centreFrequencyMHz: 600,
            bandwidthMHz: 330,
            systemTemperatureK: 50,
            polarisations: 2,
            sourceLabel: "CHIME/Pulsar system overview",
            sourceUrl: "https://arxiv.org/abs/2008.05681",
            additionalSources: Object.freeze([
                Object.freeze({
                    label: "CHIME published sensitivity assumptions",
                    url: "https://arxiv.org/abs/2012.02320"
                }),
                Object.freeze({
                    label: "CHIME pulsar specifications",
                    url: "https://arxiv.org/abs/1711.02104"
                })
            ]),
            lastVerified: "2026-08-05",
            notes: "Published near-transit planning values: approximately 6400 m² illuminated area, about 50% efficiency (1.16 K/Jy), 600 MHz reference frequency, about 330 MHz after persistent RFI excision, about 50 K system temperature and two summed polarisations. Primary-beam response, declination, RFI, frequency and sky temperature can materially change sensitivity; the cited sensitivity study cautions that its early temperature estimate may be optimistic."
        })
    ]);

    /*
     * Complete ATNF/CSIRO PSRCAT v2.8.1 compact snapshot.
     * Row shape: [PSRJ, PSRB, P0 seconds, W50 milliseconds,
     * S400 mJy, S1400 mJy, S2000 mJy]. Missing values remain null.
     */
    const PULSAR_ROWS = Object.freeze([
        /* ATNF_ROWS_START */
        ["J0002+6216",null,0.11536356826797663,null,null,0.022,null],
        ["J0006+1834",null,0.69374767047,61.3,0.2,null,null],
        ["J0007+7303",null,0.3158731908527248,null,null,null,null],
        ["J0011+08",null,2.55287,13,null,null,null],
        ["J0012+5431",null,3.0253007099721887,null,null,null,null],
        ["J0014+4746","B0011+47",1.2406990389455896,88.7,14,3,null],
        ["J0021-0909",null,2.314130829094102,23.8,null,0.134,null],
        ["J0023+0923",null,0.00305020310475439,0.2,2.9,0.5,0.5],
        ["J0024-7204C","B0021-72C",0.005756779995516346,0.664,1.53,0.52,0.23],
        ["J0024-7204D","B0021-72D",0.00535757328486573,0.303,0.95,0.35,0.2],
        ["J0024-7204E","B0021-72E",0.003536329152762437,0.9,null,null,null],
        ["J0024-7204F","B0021-72F",0.0026235793525126202,0.5,null,null,null],
        ["J0024-7204G","B0021-72G",0.004040379143565148,0.7,null,null,null],
        ["J0024-7204H","B0021-72H",0.0032103407093503167,0.6,null,null,null],
        ["J0024-7204I","B0021-72I",0.0034849920616628867,null,null,null,null],
        ["J0024-7204J","B0021-72J",0.0021006335453524617,0.209,null,0.44,0.2],
        ["J0024-7204L","B0021-72L",0.004346167999461561,0.7,null,null,null],
        ["J0024-7204M","B0021-72M",0.003676643217600219,1.2,null,null,null],
        ["J0024-7204N","B0021-72N",0.0030539543462608475,null,null,null,null],
        ["J0024-7204O",null,0.0026433432972435664,null,null,null,null],
        ["J0024-7204P",null,0.0036430206936690275,null,null,null,null],
        ["J0024-7204Q",null,0.004033181184572579,null,null,null,null],
        ["J0024-7204R",null,0.003480462707493289,null,null,null,null],
        ["J0024-7204S",null,0.0028304059578791213,null,null,null,null],
        ["J0024-7204T",null,0.007588479807367086,null,null,null,null],
        ["J0024-7204U",null,0.004342826696392332,null,null,null,null],
        ["J0024-7204V",null,0.004810167624577076,null,null,null,null],
        ["J0024-7204W",null,0.0023523445319369924,null,null,null,null],
        ["J0024-7204X",null,0.004771522910693556,null,null,null,null],
        ["J0024-7204Y",null,0.002196657143521225,null,null,null,null],
        ["J0024-7204Z",null,0.004554447383905912,null,null,null,null],
        ["J0024-7204aa",null,0.00184,null,null,null,null],
        ["J0024-7204ab",null,0.003704639494798451,null,null,null,null],
        ["J0024-7204ac",null,0.00274,null,null,0.152,null],
        ["J0024-7204ad",null,0.00374,null,null,0.084,null],
        ["J0026+6320",null,0.3183577707853687,8.1,null,1,null],
        ["J0026-1955",null,1.30615,85,null,null,null],
        ["J0030+0451",null,0.004865453286352125,null,7.9,1.09,0.63],
        ["J0032+6946",null,0.03680412,1.2,4.5,null,null],
        ["J0033+57",null,0.315,8.6,null,null,null],
        ["J0033+61",null,0.912,16,null,null,null],
        ["J0034-0534",null,0.001877181884585,0.65,24,0.21,null],
        ["J0034-0721","B0031-07",0.9429509945597656,53,52,11,null],
        ["J0036-1033",null,0.900009289,15,1,null,null],
        ["J0038-2501",null,0.2569264575329,14,null,null,null],
        ["J0039+3546",null,0.5366865103118023,8.7,null,null,null],
        ["J0040+5716","B0037+56",1.1182253452411999,12.2,7.5,0.6,null],
        ["J0040-7326",null,0.39865658079373495,24.2,null,null,null],
        ["J0040-7335",null,0.14521823105005535,2,null,null,null],
        ["J0040-7337",null,0.059888561879374455,0.87,null,null,null],
        ["J0043-7319",null,0.937434382310919,20.9,null,0.047,null],
        ["J0044-7314",null,0.396913450089732,23,null,null,null],
        ["J0045-7042",null,0.63233580002,20,null,0.064,null],
        ["J0045-7319",null,0.92627590497,20,1,0.25,null],
        ["J0048+3412","B0045+33",1.2170942960575557,18.4,2.3,null,null],
        ["J0048-7317",null,0.07931418412666637,2.1,null,null,null],
        ["J0050+03",null,1.36656,38,null,null,null],
        ["J0051+0423",null,0.354731800307637,36,3,0.5,null],
        ["J0051-7204",null,0.19144706402971887,6.5,null,0.039,null],
        ["J0054+66",null,1.3902181100730007,null,null,null,null],
        ["J0054+6650",null,1.390217485625509,null,null,null,null],
        ["J0054+69",null,null,null,null,null,null],
        ["J0054+6946",null,0.8329113287435861,14,null,null,null],
        ["J0054-7228",null,0.29094479593714084,6.2,null,null,null],
        ["J0055+5117","B0052+51",2.115171148865356,73,3.4,1.5,null],
        ["J0056+4756","B0053+47",0.47203666207644096,11.8,3,null,null],
        ["J0057-7201",null,0.7380624426,null,null,null,null],
        ["J0058+4950",null,0.9960234522737444,30.7,null,null,null],
        ["J0058+6125",null,0.637,7.8,null,null,null],
        ["J0058-7218",null,0.021766107632488065,null,null,null,null],
        ["J0059+6956",null,1.1459097060822998,12,null,null,null],
        ["J0100+8023",null,1.4936009186,8.01,null,null,null],
        ["J0100-7211",null,8.020392,null,null,null,null],
        ["J0101-6422",null,0.0025731519721683,null,null,0.156,null],
        ["J0102+4839",null,0.002964112421588179,null,0.5,null,null],
        ["J0102+6537","B0059+65",1.6791642290642343,89.7,8.5,1.2,null],
        ["J0103+54",null,0.3542991989963163,6.1,null,null,null],
        ["J0104+6029_P",null,0.8689303323468561,null,null,40,null],
        ["J0104+64",null,1.386,45,null,null,null],
        ["J0105-7208",null,0.30673712820899846,9.6,null,null,null],
        ["J0106+4855",null,0.08315730500501595,null,null,0.008,null],
        ["J0107+1322",null,1.1973833938,26.9,null,null,null],
        ["J0108+6608","B0105+65",1.283659842947923,22.5,10,0.9,null],
        ["J0108+6905","B0105+68",1.0711181098585134,12,3.7,0.4,null],
        ["J0108-1431",null,0.807564614019424,30,9,1.4,null],
        ["J0109+11",null,0.4327,null,null,null,null],
        ["J0110-22",null,1.262,43,null,null,null],
        ["J0110-2223",null,1.261959693492563,null,null,null,null],
        ["J0111+6624",null,4.301872100793386,33,null,null,null],
        ["J0111-7131",null,0.68854151164,15,null,0.044,null],
        ["J0113-7220",null,0.32588301613,4.5,null,0.189,null],
        ["J0115+6325",null,0.521455427473,22,null,null,null],
        ["J0117+5914","B0114+58",0.10143906648239018,4.1,7.6,0.3,null],
        ["J0120+1837",null,1.3133852995554554,null,null,null,null],
        ["J0121+53",null,2.7247846,20,null,null,null],
        ["J0122+1416",null,1.38899395038,21.7,null,null,null],
        ["J0125+62",null,1.70823,17,3.4,null,null],
        ["J0125-2327",null,0.003675374887568884,0.67,null,2.49,null],
        ["J0129+36",null,1.089,null,null,null,null],
        ["J0131-7310",null,0.348124045581,4.4,null,0.059,null],
        ["J0133-6957",null,0.463473741703,4.5,5,0.18,null],
        ["J0134-2937",null,0.13696161051365074,2.5,9,3.9,null],
        ["J0137+1654",null,0.4147630260237568,27,1.4,null,null],
        ["J0137+6349",null,0.717962726847017,25,null,null,null],
        ["J0139+3336",null,1.247961237704968,18,null,null,null],
        ["J0139+5621",null,1.7753563668461136,36,0.7,0.02,null],
        ["J0139+5814","B0136+57",0.272450630948639,5.2,28,4.6,null],
        ["J0139+6159_P",null,2.174806732109213,null,null,68,null],
        ["J0141+6009","B0138+59",1.222948520545672,34.9,49,4.5,null],
        ["J0141+63",null,0.0466859,2.2,1.3,null,null],
        ["J0141+6303",null,0.046680275307708005,null,null,null,null],
        ["J0146+31",null,0.9381,12.8,null,null,null],
        ["J0146+6145",null,8.688994062210817,null,null,null,null],
        ["J0147+5922","B0144+59",0.19632137543003358,7,6.6,2.1,null],
        ["J0149+29",null,2.654,null,null,null,null],
        ["J0151-0635","B0148-06",1.464664549333674,122,38,1.6,null],
        ["J0152+0948",null,2.74664729014,38.9,0.91,null,null],
        ["J0152-1637","B0149-16",0.8327416126877758,16,20,2.1,null],
        ["J0154+1833",null,0.0023645697763005993,0.2,null,0.11,null],
        ["J0156+04",null,null,3.8,null,null,null],
        ["J0156+3949","B0153+39",1.8115606113139169,99,4,null,null],
        ["J0157+6212","B0154+61",2.3517449364580285,33.4,6.5,1.9,null],
        ["J0158+21",null,0.5053,19,null,null,null],
        ["J0201+7005",null,1.3491844718464827,11,null,null,null],
        ["J0203-0150",null,0.005173321864195967,null,null,0.27,null],
        ["J0205+6449",null,0.06571592849324429,2.3,null,0.045,null],
        ["J0206-4028","B0203-40",0.6305512595685335,6.2,11,0.8,null],
        ["J0209+4331",null,0.8638826162003009,null,null,0.014,null],
        ["J0209+5759",null,1.0639062825258458,20,null,null,null],
        ["J0210+5845",null,1.7662189324423,40.9,null,null,null],
        ["J0211+4235",null,0.3507309921412785,null,null,0.109,null],
        ["J0211-8159",null,3.2319987756669453,42,6,0.3,null],
        ["J0212+5222",null,0.3763863640605848,13,4.1,0.9,null],
        ["J0212+5321",null,0.0021147,0.18,null,null,null],
        ["J0214+5222",null,0.024575294816348767,1.1,0.9,null,null],
        ["J0215+6218",null,0.5488798191549455,41,14.5,3.7,null],
        ["J0218+4232",null,0.00232309053151224,1.03,47,0.9,null],
        ["J0220+3626",null,1.0297,170.4,null,null,null],
        ["J0227+3356",null,1.2401024601761275,24.8,null,null,null],
        ["J0229+20",null,0.8069,17.7,null,null,null],
        ["J0231+6254_P",null,0.6008395915629922,null,null,141,null],
        ["J0231+7026","B0226+70",1.466820306151628,34,2.4,0.3,null],
        ["J0241+16",null,1.5454,39.2,null,null,null],
        ["J0242+62",null,0.592,18,null,null,null],
        ["J0243+6027",null,1.473,36,null,null,null],
        ["J0244+14",null,2.1281,28,null,null,null],
        ["J0245+3219_P",null,0.03092900430144895,null,null,9,null],
        ["J0248+4230",null,0.002600834785631712,null,null,null,null],
        ["J0248+6021",null,0.21709397998393504,26,null,14,null],
        ["J0250+5854",null,23.535378476,155.3,null,0.004,null],
        ["J0251+2606",null,0.0025415543469461026,null,null,null,null],
        ["J0255-5304","B0254-53",0.44770847319884904,7.4,17,5,null],
        ["J0301+35",null,0.56804,2.5,null,null,null],
        ["J0302+2252",null,1.207164839778,30.2,70,null,null],
        ["J0304+1932","B0301+19",1.387584446262276,48.1,27,15,null],
        ["J0305+1123",null,0.8620626794074611,21.5,null,null,null],
        ["J0307+7443",null,0.003156088688500316,null,0.3,null,null],
        ["J0311+1402",null,40.9106968,432,null,null,null],
        ["J0312-0921",null,0.003704335533086201,null,null,null,null],
        ["J0317+1328",null,1.9742396663711155,24.1,null,null,null],
        ["J0318+0253",null,0.005189852174520136,null,null,0.011,null],
        ["J0323+3944","B0320+39",3.0320719563851606,42.7,34,0.9,null],
        ["J0324+5239",null,0.336620230291,45,null,0.19,null],
        ["J0325+6744",null,1.3646787672817526,14,null,null,null],
        ["J0329+1654",null,0.893319660649,29.2,0.6,null,null],
        ["J0332+5434","B0329+54",0.714519699725801,6.6,1500,203,null],
        ["J0335+4555","B0331+45",0.26920054092953166,1.8,6,0.8,null],
        ["J0335+6623",null,1.7619342474221629,30,10.5,null,null],
        ["J0337+1715",null,0.0027325886324418656,0.7,null,null,null],
        ["J0337+79",null,2.05621,null,null,null,null],
        ["J0340+4130",null,0.003299339366490734,0.2,2,0.5,null],
        ["J0341+5711",null,1.888,43,364.7,null,null],
        ["J0343+06",null,1.00764,32,null,null,null],
        ["J0343+5312","B0339+53",1.9344780672938544,44.9,3.7,0.3,null],
        ["J0343-3000",null,2.5970272275189417,38,null,1.3,null],
        ["J0344-0901",null,1.2260055725983963,17.1,null,0.155,null],
        ["J0348+0432",null,0.03912265635712975,2.3,null,0.67,null],
        ["J0349+2340",null,2.4207703475464926,54,null,null,null],
        ["J0355+28",null,0.36495,2.7,null,null,null],
        ["J0357+3205",null,0.44410449883310915,null,null,null,null],
        ["J0357+5236","B0353+52",0.19703009803142257,12.5,12,1.9,null],
        ["J0358+4155",null,0.22648433225189185,2.8,null,null,null],
        ["J0358+5413","B0355+54",0.1563841215590166,2,46,23,null],
        ["J0358+6627",null,0.09150578075474834,2.3,null,null,null],
        ["J0359+5414",null,0.07942723229200248,null,null,null,null],
        ["J0401-7608","B0403-76",0.545254426954974,21,19,3.8,null],
        ["J0402+4825",null,0.5121944487308313,21.8,null,null,null],
        ["J0405+3347",null,0.06395394948122145,2.6,null,null,null],
        ["J0406+30",null,0.0026,0.246,null,null,null],
        ["J0406+3039",null,0.0026086540402373063,null,null,null,null],
        ["J0406+6138","B0402+61",0.5945761650437441,18.4,15,2.8,null],
        ["J0407+1607",null,0.02570173919463,5.6,10.2,0.35,null],
        ["J0408+4955_P",null,0.01144,null,null,0.679,null],
        ["J0408+551",null,1.837,null,null,null,null],
        ["J0408+552",null,0.754,47,null,null,null],
        ["J0410-31",null,1.8785,26,null,null,null],
        ["J0413+58",null,0.687,21,null,null,null],
        ["J0414+31",null,1.081,20,null,null,null],
        ["J0414+4859_P",null,0.80672,null,null,0.0349,null],
        ["J0415+6111",null,0.4401894160549534,null,null,null,null],
        ["J0415+6954","B0410+69",0.39071508993862825,4.4,6.4,0.5,null],
        ["J0416+5201_P",null,0.01825,null,null,0.3555,null],
        ["J0417+35",null,0.6544,8.6,null,null,null],
        ["J0417+5058_P",null,0.29136,null,null,0.0287,null],
        ["J0417+61",null,0.440283,19,1.5,null,null],
        ["J0418+5732",null,9.07838822,null,null,null,null],
        ["J0418+6635",null,0.0029101847321825964,null,null,null,null],
        ["J0418-4154",null,0.7571189450307722,14,null,null,null],
        ["J0419+44",null,1.241,null,null,null,null],
        ["J0420+4451",null,1.2411262753424905,null,null,null,null],
        ["J0420-5022",null,3.453004027143985,null,null,null,null],
        ["J0421+3255",null,0.900105016,100.7,null,null,null],
        ["J0421-0345",null,2.1613093872327593,25,6,0.5,null],
        ["J0426+4933",null,0.922474730055,14,null,0.19,null],
        ["J0427+4723",null,2.1584360924562556,null,null,null,null],
        ["J0435+2749",null,0.3262794534509304,6.9,2,0.24,null],
        ["J0437-4715",null,0.005757451941593412,0.141,550,150.2,null],
        ["J0447+2447",null,0.0029952823504138222,null,null,0.37,null],
        ["J0447-04",null,2.18819,null,null,null,null],
        ["J0448-2749",null,0.4504483308562931,11,2,2,null],
        ["J0449-7031",null,0.479163971291,7.5,null,0.056,null],
        ["J0450-1248","B0447-12",0.4380142454333775,23,11,1.2,null],
        ["J0451-67",null,0.24545429,5.5,null,0.05,null],
        ["J0452-1759","B0450-18",0.5489392232937018,27,82,17,null],
        ["J0452-3418",null,1.665118677,null,null,null,null],
        ["J0453+1559",null,0.045781816872951,0.5,null,0.33,null],
        ["J0454+4529",null,1.389136936,23.54,null,null,null],
        ["J0454+5543","B0450+55",0.3407294362346444,17,59,13,null],
        ["J0455-6951","B0456-69",0.320422711526,2.8,0.6,0.083,null],
        ["J0456-69",null,0.117073051,null,null,null,null],
        ["J0456-7031",null,0.80013207321,8,null,0.013,null],
        ["J0457+23",null,0.5049,36,null,null,null],
        ["J0457-6337",null,2.49701169613,36,null,0.03,null],
        ["J0457-69",null,0.23139039,null,null,null,null],
        ["J0458-0505",null,1.88347965849,18,null,null,null],
        ["J0458-67",null,1.1339,null,null,null,null],
        ["J0459-0210",null,1.1330771746565556,9.9,11,0.6,null],
        ["J0501+4516",null,5.762096529141806,null,null,null,null],
        ["J0502+4654","B0458+46",0.6385654815170677,19,10.8,2.5,null],
        ["J0502-6617","B0502-66",0.69125141818,null,1,null,null],
        ["J0506+50",null,0.00339,null,null,null,null],
        ["J0509+0856",null,0.00405583823156445,null,5,1.47,null],
        ["J0509+37",null,2.4961,null,null,null,null],
        ["J0509+3801",null,0.07654134872198645,5,null,null,null],
        ["J0509-6838",null,0.2787536,19,null,null,null],
        ["J0509-6845",null,0.30719713,8.4,null,null,null],
        ["J0511-6508",null,0.32206195743715593,12,null,0.31,null],
        ["J0514+4010_P",null,2.62549,null,null,0.0627,null],
        ["J0514-4002A",null,0.004990575114112222,0.32,0.28,null,0.0056],
        ["J0514-4002B",null,0.0028163,0.38,null,null,null],
        ["J0514-4002C",null,0.0055648,0.56,null,null,null],
        ["J0514-4002D",null,0.0045544,0.84,null,null,null],
        ["J0514-4002E",null,0.005595947418098155,0.47,null,null,null],
        ["J0514-4002F",null,0.0043294,0.36,null,null,null],
        ["J0514-4002G",null,0.0038028,0.7,null,null,null],
        ["J0514-4002H",null,0.0055061,0.6,null,null,null],
        ["J0514-4002I",null,0.0326542,1.5,null,null,null],
        ["J0514-4002J",null,0.0066329,0.72,null,null,null],
        ["J0514-4002K",null,0.004692,0.16,null,null,null],
        ["J0514-4002L",null,0.0029588,1.39,null,null,null],
        ["J0514-4002M",null,0.0047978,0.32,null,null,null],
        ["J0514-4002N",null,0.0055679,0.89,null,null,null],
        ["J0514-4408",null,0.3202708224090367,5.6,null,null,null],
        ["J0517+2212",null,0.22236651519824963,26.6,7,0.46,null],
        ["J0517+3436_P",null,1.59584,null,null,0.0351,null],
        ["J0518+2431",null,2.6369397366281664,null,null,0.114,null],
        ["J0518+5125",null,0.912511685262,33,null,null,null],
        ["J0518+5416",null,0.3402026515995246,9,null,null,null],
        ["J0518-6939",null,0.33020997,7.3,null,null,null],
        ["J0518-6946",null,1.690414,40,null,null,null],
        ["J0519+44",null,0.515,null,null,null,null],
        ["J0519-6931",null,0.37773586,7.5,null,null,null],
        ["J0519-6932",null,0.263211634568,3.6,null,0.13,null],
        ["J0520+3722_P",null,0.00792,null,null,0.7373,null],
        ["J0520-2553",null,0.24164220069112177,10,8,0.8,null],
        ["J0521-68",null,0.4334207,null,null,null,null],
        ["J0522-6847",null,0.67453190906,15,null,0.083,null],
        ["J0523-7125",null,0.3225,100,null,1,null],
        ["J0525+1115","B0523+11",0.35443767075852817,14.7,19.5,1.94,null],
        ["J0525-6607",null,8.047,null,null,null,null],
        ["J0526+3158_P",null,0.023,null,null,0.0156,null],
        ["J0528+2200","B0525+21",3.7455392503014053,64,57,8.9,null],
        ["J0528+3529_P",null,0.07823367572048125,1.43,null,0.5766,null],
        ["J0529-0715",null,0.6892236013587903,11.9,null,0.125,null],
        ["J0529-6652","B0529-66",0.9757368267423994,22,null,0.213,null],
        ["J0530-3847",null,0.9065019505629432,null,null,null,null],
        ["J0530-39",null,0.907,34,null,null,null],
        ["J0532-6639",null,0.64274275093,8.8,null,0.042,null],
        ["J0532-69",null,1.1491957,null,null,null,null],
        ["J0533+0402",null,0.9630178499973376,15,null,0.7,null],
        ["J0533+6759",null,0.004388159969879358,null,null,null,null],
        ["J0533-4524",null,0.157284525096,null,null,null,null],
        ["J0534+2200","B0531+21",0.033392412302258895,2,550,14,null],
        ["J0534+34",null,null,null,null,null,null],
        ["J0534-13",null,0.979,13,null,null,null],
        ["J0534-6703",null,1.81756503106,16,null,0.116,null],
        ["J0534-6905",null,0.8427825,25,null,null,null],
        ["J0535-66",null,0.21052436,null,null,null,null],
        ["J0535-6935",null,0.20051133,null,null,0.05,null],
        ["J0536-7543","B0538-75",1.2458562416893693,60,75,8.7,null],
        ["J0537-69",null,0.11261321,null,null,null,null],
        ["J0537-6910",null,0.016122222024544827,null,null,null,null],
        ["J0538+2817",null,0.1431582589117747,6.7,8.2,1.9,null],
        ["J0540+3207",null,0.5242707377994525,35,null,0.34,null],
        ["J0540+4542",null,0.401141464892712,null,null,0.17,null],
        ["J0540-6919","B0540-69",0.050569703022172514,16.98,null,0.1,null],
        ["J0540-69_P",null,0.9090003,null,null,null,null],
        ["J0540-7125",null,1.286014595,39,5,0.3,null],
        ["J0541+2959_P",null,0.00321,null,null,0.1146,null],
        ["J0541+3335_P",null,0.11365,null,null,0.0323,null],
        ["J0542-68",null,0.425189,null,null,null,null],
        ["J0543+2329","B0540+23",0.24597476889006475,4.7,29,10.7,null],
        ["J0543-6851",null,0.70895418575,53,null,0.087,null],
        ["J0544+20",null,null,2.3,null,null,null],
        ["J0545-03",null,1.07393,null,null,null,null],
        ["J0546+2441",null,2.8438494791407334,47,2.65,null,null],
        ["J0550+09",null,1.745,22.5,null,null,null],
        ["J0553+4111",null,0.5594934351697212,null,null,0.06,null],
        ["J0554+3107",null,0.4649609657362604,null,null,null,null],
        ["J0555+3948",null,1.1469058,21,null,null,null],
        ["J0555-7056",null,0.82783808575,11,null,0.058,null],
        ["J0556-67",null,0.7905492,null,null,0.12,null],
        ["J0557+1550",null,0.0025563670767829263,null,null,0.067,null],
        ["J0557+2442_P",null,1.48216,null,null,0.0208,null],
        ["J0557-2948",null,0.0436426389,0.66,null,0.046,null],
        ["J0600-5756","B0559-57",2.261364513,60,2.1,null,null],
        ["J0601-0527","B0559-05",0.39596916954318157,17,22.7,2.6,null],
        ["J0605+1937_P",null,0.69819,null,null,0.0235,null],
        ["J0605+3757",null,0.0027279542000546576,0.4,null,null,null],
        ["J0608+00",null,1.0762,17,null,null,null],
        ["J0608+1635",null,0.945844752002,18.6,null,0.14,null],
        ["J0609+2130",null,0.05569801392951,1.6,0.8,null,null],
        ["J0610-2100",null,0.003861324766937261,0.57,null,0.65,null],
        ["J0611+04",null,1.67443,81,null,null,null],
        ["J0611+1436",null,0.27032946262,17,null,1.1,null],
        ["J0611+30",null,1.41209,45.5,1.4,null,null],
        ["J0612+3721","B0609+37",0.29798232657188345,6.3,16,4,null],
        ["J0612+37216",null,0.44387136766511215,13,null,null,null],
        ["J0613+3731",null,0.6191987768316065,14.2,1.6,0.13,null],
        ["J0613-0200",null,0.003061844088094675,0.462,9.2,2.25,null],
        ["J0614+2229","B0611+22",0.33495996611057016,11,29,3.3,null],
        ["J0614+83",null,1.0392,12,1.9,null,null],
        ["J0614-3329",null,0.00314866958536681,0.36,null,0.68,null],
        ["J0620+1711_P",null,0.44103,null,null,0.0281,null],
        ["J0621+0336",null,0.26995410058794045,2.5,null,1,null],
        ["J0621+1002",null,0.0288538611940574,0.69,9.5,1.72,null],
        ["J0621+2514",null,0.0027217879391872,null,null,0.079,null],
        ["J0621-55",null,null,null,null,null,null],
        ["J0622+0339_P",null,0.008771533805528826,0.23,null,0.2885,null],
        ["J0622+3749",null,0.33320823180103,null,null,null,null],
        ["J0623+0220_P",null,0.4722,null,null,0.0244,null],
        ["J0623+0340",null,0.613759600022,18.78,null,0.27,null],
        ["J0624-0424","B0621-04",1.0390771753016936,5.1,4.9,1.4,null],
        ["J0625+10",null,0.498397,null,null,0.086,null],
        ["J0625+1403_P",null,0.72791,null,null,0.0112,null],
        ["J0627+0649",null,0.3465232908462588,3.4,null,1.9,null],
        ["J0627+0706",null,0.4758849377129841,5.1,6,1.39,null],
        ["J0627+16",null,2.18,0.3,null,null,null],
        ["J0628+0909",null,1.241421391299,8.6,null,0.058,null],
        ["J0629+2415","B0626+24",0.47662283603808464,8.4,31,3.2,null],
        ["J0630+1002_P",null,2.88147,null,null,0.0478,null],
        ["J0630+19",null,1.24855,35,null,null,null],
        ["J0630-0046",null,0.680574832268,5.1,null,0.41,null],
        ["J0630-2834","B0628-28",1.2444265229277962,63,206,32,null],
        ["J0631+0646",null,0.11097894321598467,21,null,null,null],
        ["J0631+1036",null,0.28784107294900907,6.5,1.5,1.11,null],
        ["J0633+0632",null,0.2973951905763917,null,null,null,null],
        ["J0633+1746",null,0.23709944169214436,null,null,null,null],
        ["J0633-2015",null,3.2532108384,57,null,0.2,null],
        ["J0635+0533",null,0.03385649518239002,null,null,null,null],
        ["J0636+5128",null,0.0028689528907192494,0.17,1.8,1,0.18],
        ["J0636-23",null,0.476,15,null,null,null],
        ["J0636-3044",null,0.00394576,null,null,1.51,null],
        ["J0636-4549",null,1.98459736713,17,null,0.1,null],
        ["J0637+0332_P",null,null,null,null,null,null],
        ["J0639+0828_P",null,null,null,null,null,null],
        ["J0639-0704",null,0.9864860156545613,null,null,null,null],
        ["J0640-0139",null,0.003461492546125096,null,null,null,null],
        ["J0641+0359_P",null,0.64621,null,null,0.0308,null],
        ["J0641+0448_P",null,0.02567,null,null,0.0186,null],
        ["J0641+07",null,null,null,null,null,null],
        ["J0642+0238_P",null,0.72913,null,null,0.044,null],
        ["J0643+0350_P",null,1.14486,null,null,0.0219,null],
        ["J0645+5158",null,0.008853496686414667,0.26,2.4,0.29,null],
        ["J0645+80",null,0.65787,32,5.5,null,null],
        ["J0646+0905",null,0.9039134709677942,22,null,3.6,null],
        ["J0646-54",null,0.00251,null,null,null,null],
        ["J0646-5455",null,0.0025072855777193118,null,null,0.09,null],
        ["J0647+0913",null,1.23485362778,9.6,null,0.18,null],
        ["J0648-27",null,4.169,54,null,null,null],
        ["J0651-0055_P",null,1.0507,null,null,0.082,null],
        ["J0652-0142",null,0.924053918109,21,null,0.41,null],
        ["J0653+0443_P",null,0.04753,null,null,1.1905,null],
        ["J0653+4706",null,0.0047581298242818084,0.3,null,null,null],
        ["J0653+8051","B0643+80",1.2144405115160142,13.9,6.5,0.4,null],
        ["J0653-06",null,0.79,null,null,null,null],
        ["J0656-2228",null,1.2247544488145723,16,null,3,null],
        ["J0656-5449",null,0.18315691928751113,5.7,null,0.4,null],
        ["J0658+0022",null,0.563294925255,12.67,null,0.13,null],
        ["J0658+2936",null,0.823700981333643,21.3,null,null,null],
        ["J0659+1414","B0656+14",0.3849286233650379,14.8,6.5,2.7,null],
        ["J0659-36",null,0.637,13,null,null,null],
        ["J0700+6418","B0655+64",0.1956709451662738,6,5,0.3,null],
        ["J0702-4956",null,0.6659935900128262,null,null,null,null],
        ["J0709+0458",null,0.034428978177458644,2,null,0.256,null],
        ["J0709-5923",null,0.485268383925,4.7,null,0.3,null],
        ["J0711+0931",null,1.21409049248,19.6,2.4,0.04,null],
        ["J0711-6830",null,0.0054909685076555345,1.092,10,2.6,null],
        ["J0719-2545",null,0.9747287623285494,14,null,0.8,null],
        ["J0720-3125",null,8.39111553,null,null,null,null],
        ["J0721-2038",null,0.015542394974,0.37,null,0.273,null],
        ["J0723-2050",null,0.71154,3.7,null,null,null],
        ["J0725-1635",null,0.42431140318340005,2.9,4,0.33,null],
        ["J0726-2612",null,3.4423084877,77,null,0.2,null],
        ["J0729-1448",null,0.25170865575972134,7.6,null,0.83,null],
        ["J0729-1836","B0727-18",0.510176205563134,14,11.2,1.9,null],
        ["J0732+2314",null,0.004090137082359298,1.8,null,0.73,null],
        ["J0733-2345",null,1.7962497011679064,18,null,0.07,null],
        ["J0734+14",null,1.772,null,null,null,null],
        ["J0734-1559",null,0.15625,null,null,null,null],
        ["J0736-6304",null,4.8628739612,30,null,null,null],
        ["J0737-2202",null,0.32037007073732865,5.3,null,0.47,null],
        ["J0737-3039A",null,0.022699378599623916,14.3,null,3.06,null],
        ["J0737-3039B",null,2.773460770066061,58,null,1.3,null],
        ["J0738+6904",null,6.827692802169157,61,null,null,null],
        ["J0738-4042","B0736-40",0.37492073594421266,25,190,112.6,null],
        ["J0740+6620",null,0.002885736411412693,0.25,32.5,1.1,null],
        ["J0741+17",null,1.73,null,null,null,null],
        ["J0742+4110",null,0.0031391369352910497,0.64,5.8,null,null],
        ["J0742+4334",null,0.606190680037,30,null,null,null],
        ["J0742-2822","B0740-28",0.16676229157216363,4.4,296,26,null],
        ["J0744-2525",null,0.09199632014719412,null,null,null,null],
        ["J0745-5353","B0743-53",0.21483850578191938,10.7,23,5,null],
        ["J0746+5514",null,2.893667502456255,null,null,null,null],
        ["J0746-4529",null,2.79102517845,38,null,0.2,null],
        ["J0747+6646",null,0.40770052440883003,6,null,null,null],
        ["J0749+5720",null,1.174929283962068,null,null,null,null],
        ["J0749-4247",null,1.0954530505155096,15,8,0.5,null],
        ["J0750+57",null,1.17487,13,2.9,null,null],
        ["J0750-6846",null,0.9152158036117475,188.5,null,1.7,null],
        ["J0751+1807",null,0.0034787708392793647,0.7,10,1.35,null],
        ["J0753-0816",null,2.09362,null,null,null,null],
        ["J0754+3231","B0751+32",1.442349479142921,30.3,8,0.6,null],
        ["J0758-1528","B0756-15",0.6822651758059591,7.3,8.2,2.6,null],
        ["J0758-30",null,1.092,27,null,null,null],
        ["J0758-3002",null,1.091869715468353,null,null,null,null],
        ["J0802-5613",null,0.273972602739726,null,null,null,null],
        ["J0803+34",null,null,null,null,null,null],
        ["J0803-0942",null,0.5712565591549804,8.21,null,0.102,null],
        ["J0804-3647",null,2.19198689593,32,null,0.29,null],
        ["J0806+08",null,2.0631,54,null,null,null],
        ["J0806-4123",null,11.370385928090423,null,null,null,null],
        ["J0807-5421",null,0.5266436714085952,11,null,0.4,null],
        ["J0808-3937",null,0.86634928471,11,null,0.21,null],
        ["J0809-4753","B0808-47",0.5472021186838315,8.5,46,2.6,null],
        ["J0811+3729",null,1.248264327889421,22,null,null,null],
        ["J0812-3905",null,0.482595929159,37,null,0.38,null],
        ["J0813+2202",null,0.531382788788691,60,null,null,null],
        ["J0814+7429","B0809+74",1.2922414468619536,41.4,79,10,null],
        ["J0815+0939",null,0.64516119106,55.8,3.7,null,null],
        ["J0815+4611",null,0.4342422517307,9.3,2.5,null,null],
        ["J0818-3049",null,0.7637418483,46,null,0.33,null],
        ["J0818-3232",null,2.161259409557837,11,null,1.4,null],
        ["J0820-1350","B0818-13",1.2381295438681763,23,102,6,null],
        ["J0820-3826",null,0.12483747909178167,6,null,0.49,null],
        ["J0820-3921",null,1.07356658405,46,null,0.4,null],
        ["J0820-4114","B0818-41",0.5454455631512248,141,65,5,null],
        ["J0821-4221",null,0.3967301802158189,4.3,null,0.8,null],
        ["J0821-4300",null,0.11279945507174324,null,null,null,null],
        ["J0823+0159","B0820+02",0.8648728046988048,22.4,30,4,null],
        ["J0824+0028",null,0.009861348670367318,null,null,0.51,null],
        ["J0826+2637","B0823+26",0.5306605116860001,8,73,10,null],
        ["J0827+53",null,0.0135,6.7,null,null,null],
        ["J0828+5304",null,0.013527395816236144,null,null,null,null],
        ["J0828-3417","B0826-34",1.848918803654907,113,16,0.25,null],
        ["J0831-4406",null,0.311673518473,5.5,null,0.43,null],
        ["J0834-4159",null,0.12111775926493869,4.7,null,0.28,null],
        ["J0834-60",null,0.384645,null,null,null,null],
        ["J0835-3707",null,0.5414043736269504,4.2,null,0.28,null],
        ["J0835-4510","B0833-45",0.08932838502359318,1.7,5000,1050,null],
        ["J0836-4233",null,0.73843560627,14,null,0.129,null],
        ["J0837+0610","B0834+06",1.2737682915784503,26,89,5,null],
        ["J0837-2454",null,0.6294102885129085,1,null,null,null],
        ["J0837-4135","B0835-41",0.7516254225473826,4.4,197,35,null],
        ["J0838-2621",null,0.3085806879669152,7.8,null,0.5,null],
        ["J0838-2827",null,0.0036153610123447048,null,null,null,null],
        ["J0838-3947",null,1.7039457055449228,57,null,0.11,null],
        ["J0839-66",null,0.449339,null,null,null,null],
        ["J0840-5332","B0839-53",0.7206140275125867,23,19,1.7,null],
        ["J0842-4851","B0840-48",0.6443667154778621,6.9,6.2,1.07,null],
        ["J0843+0719",null,1.36586,23,null,null,null],
        ["J0843+67",null,0.002846,null,null,null,null],
        ["J0843-5022",null,0.20895581408275532,5.5,null,0.7,null],
        ["J0846-3533","B0844-35",1.116098657740146,19,16,5,null],
        ["J0847-4316",null,5.977492737,53,null,null,null],
        ["J0848+16",null,0.4524,8.8,null,null,null],
        ["J0849+8028","B0841+80",1.6022279738714946,27,1.5,null,null],
        ["J0849-6322",null,0.36795380205803624,5.7,null,1,null],
        ["J0853-4648",null,0.473156,null,null,null,null],
        ["J0854+5449",null,1.2330326022909877,9.3,null,null,null],
        ["J0855-3331","B0853-33",1.2675409181414734,19,7.7,0.6,null],
        ["J0855-4644",null,0.0646861308252,5.1,null,0.28,null],
        ["J0855-4658",null,0.57507238258,8.4,null,0.23,null],
        ["J0856-6137","B0855-61",0.9625108717504657,20,11,3.3,null],
        ["J0857+3349",null,0.24296107706,6.3,0.4,null,null],
        ["J0857-4424",null,0.3267933498191605,9.6,12,0.98,null],
        ["J0900-3144",null,0.011109649338094302,0.2,null,3.84,null],
        ["J0901-4046",null,75.88554711486678,299,null,null,null],
        ["J0901-4624",null,0.44205834405094524,3.9,null,0.51,null],
        ["J0902-6325","B0901-63",0.6603135135210423,17,4.5,1.7,null],
        ["J0904-4246","B0903-42",0.9651735869552593,9.4,8,0.6,null],
        ["J0904-7459","B0904-74",0.549553759115343,18,11,2,null],
        ["J0905-4536",null,0.9882807496747109,32,13,1.1,null],
        ["J0905-5127",null,0.3463098716422328,8.1,12,1.05,null],
        ["J0905-6019",null,0.340854176542,6.3,null,0.3,null],
        ["J0907-5157","B0905-51",0.253558014505007,13,35,17,null],
        ["J0908-1739","B0906-17",0.40162562344216124,8.6,16,4,null],
        ["J0908-4913","B0906-49",0.10677138400877946,2.4,28,20,null],
        ["J0909-7212","B0909-71",1.3628904225986147,13,6.5,1.9,null],
        ["J0910+77","B0904+77",1.57905,null,null,null,null],
        ["J0911-42",null,1.94063595,30.3,null,0.05,null],
        ["J0912-3851",null,1.526085076,37,null,0.1,null],
        ["J0916-5243",null,1.310444,null,null,null,null],
        ["J0917-4413",null,0.05290541,null,null,null,null],
        ["J0919-42",null,0.8126,null,null,null,null],
        ["J0919-6040",null,1.216975723,26,null,0.2,null],
        ["J0921+6254","B0917+63",1.5679940184795544,38,5,0.5,null],
        ["J0921-5202",null,0.009679813766248112,0.79,null,0.189,null],
        ["J0922+0638","B0919+06",0.43063215487791234,11.4,52,10,null],
        ["J0922-4534",null,0.0044165594,null,null,null,null],
        ["J0922-4949",null,0.9503570093110768,2.8,null,0.52,null],
        ["J0923-31",null,null,null,null,null,null],
        ["J0924-5302","B0922-52",0.7463435484002093,4.4,12,1.1,null],
        ["J0924-5814","B0923-58",0.7395054700038848,43,22,6,null],
        ["J0925+6103",null,0.005982512892605481,null,null,0.2,null],
        ["J0927+2345",null,0.7618892360533487,17.5,1,0.06,null],
        ["J0927-5242",null,0.327951,null,null,null,null],
        ["J0928+06",null,2.0604,25.2,null,null,null],
        ["J0928+3039",null,1.0457566344085656,29.6,null,null,null],
        ["J0930-1854",null,null,1.5,null,null,null],
        ["J0930-2301",null,1.80706867799,46,null,null,null],
        ["J0931-1902",null,0.0046380293914294185,0.45,null,0.52,null],
        ["J0932-3217",null,1.93162674308,13.4,null,0.3,null],
        ["J0932-5327",null,4.392158712729238,69,null,0.15,null],
        ["J0933-4604",null,3.66991,null,null,null,null],
        ["J0934-4154",null,0.57040923643,12,null,0.3,null],
        ["J0934-5249","B0932-52",1.4447778868008176,24,18,3.2,null],
        ["J0935+3312",null,0.9615534192415544,40.8,null,null,null],
        ["J0936-4750",null,0.522581,null,null,null,null],
        ["J0940-5428",null,0.08756856188944391,2.8,null,0.66,null],
        ["J0941-39",null,0.58677841838,null,null,null,null],
        ["J0941-5244",null,0.6585586542679499,17,11,0.5,null],
        ["J0942-5552","B0940-55",0.6643886813760521,9.7,55,11,null],
        ["J0942-5657","B0941-56",0.8081705414061132,4.7,13,1,null],
        ["J0943+1631","B0940+16",1.0874178276972961,55,7,1.3,null],
        ["J0943+2253",null,0.5329747057408513,10.2,5.5,0.39,null],
        ["J0943-5305",null,1.734,8.7,null,null,null],
        ["J0944+4106",null,2.2294312669798004,51.4,null,null,null],
        ["J0944-1354","B0942-13",0.5702641727555902,7.8,26,0.6,null],
        ["J0945-4833",null,0.3315855987755,4.5,null,0.39,null],
        ["J0946+0951","B0943+10",1.0977057048553227,40.8,4,null,null],
        ["J0947+2740",null,0.851013803292077,36.2,1,0.13,null],
        ["J0948-5549",null,0.1660954,null,null,null,null],
        ["J0949-6902",null,0.64001572416,5,null,0.3,null],
        ["J0951-71",null,0.212378,null,null,null,null],
        ["J0952-0607",null,0.0014137983550231202,null,null,null,null],
        ["J0952-3839","B0950-38",1.3738159316842975,31,8.5,4,null],
        ["J0953+0755","B0950+08",0.2530654277592876,8.6,400,100,null],
        ["J0954-5430",null,0.47286602029833075,11,null,0.51,null],
        ["J0954-5754",null,0.0048352732,null,null,null,null],
        ["J0955-3947",null,0.002022726214251798,null,null,null,null],
        ["J0955-5304","B0953-52",0.862122572164555,4.2,29,0.94,null],
        ["J0955-6150",null,0.0019993604927576823,null,null,0.639,null],
        ["J0957-0619",null,1.7237,null,null,null,null],
        ["J0957-5432",null,0.20355669753617672,3.2,null,0.18,null],
        ["J0959-4809","B0957-47",0.670085886865293,98,16,4,null],
        ["J1000+08",null,0.440372,null,null,null,null],
        ["J1000-5149",null,0.255677098425,4.5,null,0.26,null],
        ["J1001-5507","B0959-54",1.4366388546678595,9.8,80,10,null],
        ["J1001-5559",null,1.6611773795098856,13,null,1.4,null],
        ["J1001-5603",null,0.379533,null,null,null,null],
        ["J1001-5939",null,7.733640264889151,30,null,0.15,null],
        ["J1002-5559",null,0.7775009066640223,25,null,0.12,null],
        ["J1002-5919",null,0.7134892535,15,null,0.17,null],
        ["J1003+41",null,0.88,null,null,null,null],
        ["J1003-4747","B1001-47",0.3070742192346082,6.6,6,1.43,null],
        ["J1005+3015",null,3.066365185979466,null,null,null,null],
        ["J1006-6311",null,0.835797468,20,4,0.119,null],
        ["J1010+15",null,null,null,null,null,null],
        ["J1012+5307",null,0.005255749101969821,0.2,30,4,null],
        ["J1012-2337","B1010-23",2.517945020504389,39,4.1,0.135,null],
        ["J1012-4235",null,0.0031011412470793634,null,null,0.258,null],
        ["J1012-5830",null,2.1335912144,19,null,0.08,null],
        ["J1012-5857","B1011-58",0.8199290126827874,8.8,15,1.91,null],
        ["J1013-5934",null,0.44290102297840733,4.8,null,2.6,null],
        ["J1014-48",null,1.5088,21,null,null,null],
        ["J1015-5359",null,0.0208005,null,null,null,null],
        ["J1015-5719",null,0.13992048394908696,46,null,3,null],
        ["J1016-5345","B1014-53",0.7695861785235945,8.3,3.5,1.1,null],
        ["J1016-5819",null,0.08783426107731357,2.9,null,0.36,null],
        ["J1016-5857",null,0.1073864584587657,9,null,0.9,null],
        ["J1017+3011",null,0.452785073,180,null,null,null],
        ["J1017-5621","B1015-56",0.5034626204676947,3.4,15,2.2,null],
        ["J1017-7156",null,0.002338514440402662,0.06,null,1.09,null],
        ["J1018-1523",null,0.08315253522349611,2,null,null,null],
        ["J1018-1642","B1016-16",1.804696435688124,37,5.1,0.7,null],
        ["J1019-5749",null,0.1625125667701198,47,null,3.8,null],
        ["J1020-5510",null,0.003942778,null,null,null,null],
        ["J1020-5921",null,1.23830534423,17,null,0.2,null],
        ["J1020-6026",null,0.14048128980861305,14,null,0.25,null],
        ["J1020-6158",null,0.2828786,null,null,null,null],
        ["J1021-5601",null,0.6700262976088849,57,null,0.37,null],
        ["J1022+1001",null,0.016452929958449262,0.5,75,3.9,null],
        ["J1022-5813",null,1.643726002,36,null,0.2,null],
        ["J1023+0038",null,0.0016879874702210563,null,null,null,null],
        ["J1023-5746",null,0.11147243434221338,null,null,null,null],
        ["J1024-0719",null,0.0051622046412995145,0.521,4.6,1.5,null],
        ["J1028-5819",null,0.0914032309,0.1,null,0.24,0.52],
        ["J1030-6008",null,0.027324461,null,null,null,null],
        ["J1031-6117",null,0.306410837119,9.3,null,0.12,null],
        ["J1032-5206",null,2.4076223113451127,21,null,0.19,null],
        ["J1032-5804",null,0.0787410121110801,null,null,null,null],
        ["J1032-5911","B1030-58",0.4642126266011124,20,14,1.1,null],
        ["J1034-3224",null,1.1505906194763893,248,41,8,null],
        ["J1034-5817",null,0.79148,null,null,null,null],
        ["J1034-5934",null,0.03447143,null,null,null,null],
        ["J1035-6345",null,0.579576736318,7.4,null,0.24,null],
        ["J1035-6720",null,0.002872006391697237,null,null,0.065,null],
        ["J1036-4353",null,0.0016801080326780743,null,null,null,null],
        ["J1036-4926",null,0.5103696598184632,3,9,0.8,null],
        ["J1036-6559",null,0.53350188629,9.4,null,0.3,null],
        ["J1036-8317",null,0.003408,null,null,0.45,null],
        ["J1038+0032",null,0.02885155795131,2.1,null,0.102,null],
        ["J1038-5831","B1036-58",0.6619933522797068,16,null,2.3,null],
        ["J1039-6108",null,0.2715526,null,null,null,null],
        ["J1039-6208",null,1.246563,null,null,null,null],
        ["J1041-1942","B1039-19",1.3863689665029715,50,28,2.3,null],
        ["J1042-5521","B1039-55",1.1708682886600488,25,14,0.62,null],
        ["J1043-6116",null,0.2886052873879606,4.8,null,1.39,null],
        ["J1044-5737",null,0.13902889109808206,null,null,null,null],
        ["J1045-0436",null,0.02404751703417241,1.2,null,null,null],
        ["J1045-4509",null,0.007474224230144267,0.84,15,2.74,null],
        ["J1046+0304",null,0.326271446035,25.3,null,0.3,null],
        ["J1046-5813","B1044-57",0.36942827225355773,8.3,18,1.37,null],
        ["J1047-3032",null,0.3303281017247823,20,8,1.1,null],
        ["J1047-6709",null,0.19845294937810476,1.9,4,3.1,null],
        ["J1048+2339",null,0.004665162937270437,null,null,0.175,null],
        ["J1048+5349",null,2.7308615855240617,null,null,null,null],
        ["J1048-5832","B1046-58",0.12374026167760617,7.7,null,9.1,null],
        ["J1048-5838",null,1.23130477663,14,null,null,null],
        ["J1049+5822",null,0.7276178728795206,null,null,null,null],
        ["J1049-5833",null,2.202328278863169,32,null,0.7,null],
        ["J1050-5953",null,6.452076578587154,null,null,null,null],
        ["J1051-6214",null,1.14605,null,null,null,null],
        ["J1052-5954",null,0.180591500693,2.3,null,0.147,null],
        ["J1052-6348",null,0.3838304235316973,6.4,null,0.11,null],
        ["J1054-5943",null,0.346908957903,2.4,null,0.31,null],
        ["J1054-5946",null,0.228324249982,6.7,null,0.2,null],
        ["J1054-6452",null,1.8400035413768,20,null,0.25,null],
        ["J1055-6022",null,0.9475584092665961,23.2,null,0.2,null],
        ["J1055-6028",null,0.09966083348,3.7,null,0.95,null],
        ["J1055-6236",null,0.44863544246,7.5,null,0.12,null],
        ["J1055-6905",null,2.9193969868,43,null,0.3,null],
        ["J1056-5709",null,0.6760818937394011,20,null,0.11,null],
        ["J1056-6258","B1054-62",0.42245108798215875,17,45,34,null],
        ["J1056-7117",null,0.026309676982433597,5,null,0.5,null],
        ["J1057-4754",null,0.628305878552,20,null,0.53,null],
        ["J1057-5226","B1055-52",0.19711559666990514,13,80,4.4,null],
        ["J1057-5851",null,0.6203650313417567,null,null,null,null],
        ["J1057-7914","B1056-78",1.3474040034364363,24,6.5,0.6,null],
        ["J1058-5957",null,0.6162707293489278,16,null,0.6,null],
        ["J1059+6459",null,3.6311696785970633,37,null,null,null],
        ["J1059-5742","B1056-57",1.185003307812434,17,19,2,null],
        ["J1101-6101",null,0.06280007682207797,null,null,null,null],
        ["J1101-6424",null,0.005109272904279,0.54,null,0.302,null],
        ["J1102+02",null,0.00405,null,null,null,null],
        ["J1103-5403",null,0.003392709659325501,0.14,null,0.395,null],
        ["J1103-6025",null,0.396586748928,4.6,null,0.17,null],
        ["J1104-6103",null,0.2809053015394,4.1,5,0.24,null],
        ["J1105+02",null,6.40305537205635,null,null,null,null],
        ["J1105+37",null,0.875,null,null,null,null],
        ["J1105-4353",null,0.35111186198,13.107,null,0.189,null],
        ["J1105-6037",null,0.19493826711322126,null,null,null,null],
        ["J1105-6107",null,0.06320213091790895,3.1,null,1.2,null],
        ["J1106-6438",null,2.7179341359881612,27,null,0.19,null],
        ["J1107-5907",null,0.2527733234178088,9.3,null,0.18,null],
        ["J1107-5947","B1105-59",1.5165309654,38.3,7,0.3,null],
        ["J1107-6143",null,1.7993956675,26,null,0.38,null],
        ["J1108-6329",null,0.0042775833,null,null,null,null],
        ["J1110+58",null,0.79335,17,1.6,null,null],
        ["J1110-5637","B1107-56",0.558254373368017,21,null,3.29,null],
        ["J1111-6039",null,0.10668919942558534,null,null,null,null],
        ["J1112-6103",null,0.06496185189352785,11,null,2.3,null],
        ["J1112-6613","B1110-65",0.3342139735072788,14,19,1.7,null],
        ["J1112-6926","B1110-69",0.820488094061455,26,13,0.6,null],
        ["J1114-6100","B1112-60",0.8808654186783504,32,null,5.36,null],
        ["J1115+5030","B1112+50",1.6564397599369094,16.6,12,3,null],
        ["J1115-0956",null,1.3108940203042145,17,null,0.22,null],
        ["J1115-6052",null,0.2597818896541238,4.3,null,0.48,null],
        ["J1116-2444",null,0.86794888009,6.8,null,null,null],
        ["J1116-4122","B1114-41",0.9431654757017838,11,26,6,null],
        ["J1117-6154",null,0.5051058030695322,4.9,null,1.6,null],
        ["J1117-6447",null,1.1552719604,61,null,0.14,null],
        ["J1119-6127",null,0.4079629835557105,26,null,1.09,null],
        ["J1119-7936","B1118-79",2.2806022645615562,40,7,0.7,null],
        ["J1120-24",null,0.497,7,null,null,null],
        ["J1120-3618",null,0.005557016759663602,null,null,0.3,null],
        ["J1121-5444","B1119-54",0.5357869491086454,19,24,1.5,null],
        ["J1122-3546",null,0.007838069356898089,1,null,null,null],
        ["J1123-4844",null,0.24483853755555704,2.6,8,1,null],
        ["J1123-6102",null,0.640238352798685,8.7,null,1.1,null],
        ["J1123-6259",null,0.27143812865944167,6.4,11,0.51,null],
        ["J1123-6651",null,0.23297887227697572,16,8,0.6,null],
        ["J1124-3653",null,0.002409572673323117,null,0.3,null,null],
        ["J1124-5638",null,0.185559973402,14,null,0.31,null],
        ["J1124-5916",null,0.13547685440993334,10,null,0.08,null],
        ["J1124-6421",null,0.47909858452,14,null,0.19,null],
        ["J1125+7819",null,0.00420160911826384,0.43,17.1,1.1,null],
        ["J1125-5825",null,0.0031022139189341635,0.31,null,1,null],
        ["J1125-6014",null,0.002630380781478504,0.21,null,1.32,null],
        ["J1126-2737",null,0.358161,9,null,null,null],
        ["J1126-38",null,0.88755,31,null,null,null],
        ["J1126-6054","B1124-60",0.20273719421559228,4.2,null,1.4,null],
        ["J1126-6942",null,0.579418751784264,11,9,0.3,null],
        ["J1128-6219",null,0.5159835105,93,null,0.27,null],
        ["J1129-53",null,1.06288,null,null,null,null],
        ["J1130+0921",null,4.796636974976947,null,null,null,null],
        ["J1130-5826",null,0.162323475501,2.7,null,0.18,null],
        ["J1130-5925",null,0.6809838324204971,15,null,0.12,null],
        ["J1130-6807",null,0.25635317100114907,33,8,0.55,null],
        ["J1132+25",null,1.002,16.2,null,null,null],
        ["J1132-4700",null,0.32563351002468666,18,null,0.49,null],
        ["J1132-5627",null,0.175166247082,2.1,null,0.09,null],
        ["J1133-6250","B1131-62",1.0228756127923433,263,null,7,null],
        ["J1134-6207",null,0.688961,null,null,null,null],
        ["J1135-49",null,null,9,null,null,null],
        ["J1135-6055",null,0.1149425287356322,null,null,null,null],
        ["J1136+1551","B1133+16",1.1879172746306204,5.8,257,20,null],
        ["J1136-5525","B1133-55",0.36471452773595125,14,23,6,null],
        ["J1136-64",null,1.023619,18.1,null,0.07,null],
        ["J1136-6527",null,1.18930900495,19.6,null,0.14,null],
        ["J1137+7528",null,0.002512642383277,null,null,null,null],
        ["J1137-6700",null,0.5562161259310893,87,14,1.5,null],
        ["J1138-6154",null,0.624372,null,null,null,null],
        ["J1138-6207",null,0.11756379402284821,9.2,null,0.57,null],
        ["J1139-6247",null,0.12048192771084336,null,null,null,null],
        ["J1141-3107",null,0.5384334657027542,20,10,0.8,null],
        ["J1141-3322",null,0.29146787770066274,5.4,8,1.6,null],
        ["J1141-6545",null,0.3938988148377834,7.7,null,2.4,null],
        ["J1142+0119",null,0.0050752983064042,0.3,null,0.045,null],
        ["J1142-6230",null,0.5583833856869734,30,null,0.26,null],
        ["J1143-5158",null,0.675646047064,6.6,7,0.3,null],
        ["J1143-5536",null,0.68535848563,13,null,0.2,null],
        ["J1144-6146",null,0.987783069335335,33,null,0.45,null],
        ["J1144-6217",null,0.8506649433737226,7.5,null,0.2,null],
        ["J1146-6030","B1143-60",0.27337450864355883,11,17,3.2,null],
        ["J1146-6610",null,0.003722312502674,0.79,null,0.55,null],
        ["J1148-5725",null,3.559937231991271,42,null,0.12,null],
        ["J1148-6415",null,3.2410285031,37,null,0.06,null],
        ["J1148-6546",null,1.496743,null,null,null,null],
        ["J1151-6108",null,0.10163317676014806,6.9,null,0.06,null],
        ["J1152-5800",null,1.7898294664496943,16,null,0.12,null],
        ["J1152-6012",null,0.37656956576,8.1,null,0.17,null],
        ["J1152-6056",null,2.449,6.1,null,null,null],
        ["J1153-2117",null,2.34348,null,null,null,null],
        ["J1154-19",null,0.0111,0.5,null,null,null],
        ["J1154-6250",null,0.28201171065,7.4,null,0.07,null],
        ["J1155-6529",null,0.07886984,null,null,null,null],
        ["J1156-1318",null,null,null,null,null,null],
        ["J1156-5707",null,0.2884167739097188,2.5,null,0.27,null],
        ["J1156-5909",null,1.0379310509,15,7,null,null],
        ["J1157-5112",null,0.04358922706284,2.2,null,0.276,null],
        ["J1157-6224","B1154-62",0.4005257166957991,12,145,14,null],
        ["J1159-6409",null,0.6674855607641537,211,null,0.47,null],
        ["J1159-7910",null,0.5250766481445813,12,6,0.7,null],
        ["J1201-6306",null,0.59213602908,10,null,0.13,null],
        ["J1202-5820","B1159-58",0.4528034284918278,10,23,3,null],
        ["J1203-6242",null,0.1006036217303823,null,null,null,null],
        ["J1204-6843",null,0.3088610148481538,8.8,null,0.5,null],
        ["J1207-4508",null,1.7698278463853214,73,null,0.31,null],
        ["J1207-5050",null,0.004842757322802952,null,null,0.39,null],
        ["J1208-5936",null,0.028713859892136328,null,null,null,null],
        ["J1208-6238",null,0.4405907236520865,null,null,null,null],
        ["J1210-5226",null,0.42413074881460533,null,null,null,null],
        ["J1210-5559",null,0.27976786865341124,4.9,23,1.27,null],
        ["J1210-6322",null,1.16318571439,66,null,0.151,null],
        ["J1210-6550",null,4.237010216448514,33,null,0.17,null],
        ["J1211-6324",null,0.4330841129386243,11,null,0.45,null],
        ["J1212-5838",null,0.0738021,null,null,null,null],
        ["J1214-5830",null,0.90982270118,8,null,0.14,null],
        ["J1215-5328",null,0.6364142211735557,35,null,0.5,null],
        ["J1216-50",null,6.355,9,null,null,null],
        ["J1216-6223",null,0.37405301358128784,15,null,0.23,null],
        ["J1216-6410",null,0.0035393757140924544,0.22,null,1.15,null],
        ["J1220-6318",null,0.7892120794006706,56,null,0.68,null],
        ["J1221-0633",null,0.00193453969552671,0.18,null,null,null],
        ["J1222-5738",null,1.0811635266,7.4,null,0.11,null],
        ["J1223-5856",null,0.28854142685,63.3,null,0.377,null],
        ["J1224-6208",null,0.5857612081215525,9.7,null,0.23,null],
        ["J1224-6407","B1221-63",0.21647979787011593,5.3,48,8.9,null],
        ["J1225-5556",null,1.018452868182,20,5,0.3,null],
        ["J1225-6035",null,0.626323941978,3.1,null,0.26,null],
        ["J1225-6408","B1222-63",0.4196190755112788,4.5,11,1.26,null],
        ["J1226+0005",null,2.28507617026,48,0.5,null,null],
        ["J1226-3223",null,6.1930040852,54,null,null,null],
        ["J1227-4853",null,0.001686375410272992,null,null,null,null],
        ["J1227-6208",null,0.03452783468874251,1.3,null,0.272,null],
        ["J1227-63",null,0.44457796,15,null,null,null],
        ["J1231-1411",null,0.0036838787699598886,0.44,null,0.29,null],
        ["J1231-4609",null,0.8772391105299803,43,null,1.7,null],
        ["J1231-5113",null,0.2066115702479339,null,null,null,null],
        ["J1231-5929",null,0.4098337,null,null,null,null],
        ["J1231-6303",null,1.351236392614496,174.2,null,1.5,null],
        ["J1231-6511",null,0.24752475247524752,null,null,null,null],
        ["J1232-4742",null,1.872994377,92,null,2.38,null],
        ["J1232-5843",null,0.2853184,null,null,null,null],
        ["J1232-6501",null,0.08828190823414325,11,null,0.34,null],
        ["J1233-6312",null,0.5647593892,53,null,0.25,null],
        ["J1233-6344",null,0.75689193363,11,null,0.07,null],
        ["J1234-3630",null,0.569242225079,11,null,null,null],
        ["J1235-54","B1232-55",0.63823381,44,4.5,1,null],
        ["J1235-6354",null,0.256777653406,9,null,0.16,null],
        ["J1236-0159",null,3.5975735967,89,null,null,null],
        ["J1236-5033",null,0.2947598816657899,12,null,0.6,null],
        ["J1236-65",null,0.1005652,3.5,null,0.09,null],
        ["J1237-6725",null,2.11097411794,31,null,0.4,null],
        ["J1238+2152",null,1.1185906894463322,18,2,null,null],
        ["J1239+0326",null,0.8583265624071222,null,null,0.025,null],
        ["J1239+2453","B1237+25",1.3824491030387713,45.2,110,23,null],
        ["J1239+3239",null,0.0047,0.36,null,null,null],
        ["J1239-48",null,0.6539,null,null,null,null],
        ["J1239-6832","B1236-68",1.3019243977510733,19,6.5,0.96,null],
        ["J1240-4124","B1237-41",0.5122444834002815,4.5,3.5,0.6,null],
        ["J1242+39",null,1.31,37,null,null,null],
        ["J1242-4712",null,0.005313346943976302,null,null,null,null],
        ["J1243+17",null,1.2165,200,null,null,null],
        ["J1243-5735",null,0.47122487769,15,null,0.14,null],
        ["J1243-6423","B1240-64",0.38848512711014244,5.3,110,34,null],
        ["J1244-1812",null,3.42532370680272,43,null,0.2,null],
        ["J1244-4708",null,1.411433339791577,null,null,null,null],
        ["J1244-5053",null,0.275207111323,5.4,null,0.2,null],
        ["J1244-6359",null,0.14727431048,9.6,null,0.15,null],
        ["J1244-6437",null,0.2129047,null,null,null,null],
        ["J1244-6531",null,1.54681894,21,null,0.17,null],
        ["J1245-6238",null,2.283093350802984,60,null,0.14,null],
        ["J1246+2253",null,0.47387055751829316,7.6,29,0.39,null],
        ["J1248-6344",null,0.198335136357,12,null,0.2,null],
        ["J1248-6444",null,1.23489349389,53,null,0.15,null],
        ["J1249-6507",null,0.43444487308,8.9,null,0.1,null],
        ["J1251-7407",null,0.32705773823,3.2,null,0.2,null],
        ["J1252+53",null,0.2201035829,20,null,null,null],
        ["J1252-6314",null,0.8233393660548488,19,null,0.66,null],
        ["J1253-5820",null,0.2554982178300254,3.7,20,4.1,null],
        ["J1254-6150",null,0.184502203069,3.1,null,0.15,null],
        ["J1255-46",null,0.052,null,null,null,null],
        ["J1255-6131",null,0.65797363034,5.8,null,0.13,null],
        ["J1255-62",null,0.18291150816,34.8,null,0.13,null],
        ["J1257-1027","B1254-10",0.6173079823842674,6.6,12,1.2,null],
        ["J1259-6741","B1256-67",0.66333024824265,22,4.5,1.3,null],
        ["J1300+1240","B1257+12",0.00621853194840048,0.75,20,0.39,null],
        ["J1300-6602",null,1.14331584211,22.1,null,0.119,null],
        ["J1301+0833",null,0.001843725626372221,0.4,null,null,null],
        ["J1301-6305",null,0.18452809508644874,22,null,0.49,null],
        ["J1301-6310",null,0.6638296477,12,null,0.11,null],
        ["J1302-3258",null,0.0037708530914204357,null,0.5,0.17,null],
        ["J1302-63",null,0.32572433,7,null,0.1,null],
        ["J1302-6313",null,0.9678462129,93,null,0.18,null],
        ["J1302-6350","B1259-63",0.04776250754158053,4.9,null,4.5,null],
        ["J1303+3815",null,0.39627397772730044,4,null,null,null],
        ["J1303-62",null,0.41941599,14.7,null,0.09,null],
        ["J1303-6305",null,2.3066415539322183,34,null,0.36,null],
        ["J1304+12",null,0.00418,null,null,null,null],
        ["J1305-6203",null,0.4277736633168621,16,null,0.67,null],
        ["J1305-6256",null,0.47823093283903423,19,null,0.32,null],
        ["J1305-6455","B1302-64",0.5716524152602183,14,29,2.1,null],
        ["J1305-66",null,0.1972763,null,null,0.2,null],
        ["J1306-4035",null,0.00220453,null,null,2.1,null],
        ["J1306-60",null,1.783181,156,null,0.09,null],
        ["J1306-6043",null,0.005671161,null,null,null,null],
        ["J1306-6242",null,0.98190211848,37,null,0.14,null],
        ["J1306-6617","B1303-66",0.47302779989551125,22,null,4.91,null],
        ["J1307-6318",null,4.962427252509906,505,null,1.4,null],
        ["J1307-67",null,3.6512,2,null,null,null],
        ["J1308+2127",null,10.31252206,null,null,null,null],
        ["J1308-23",null,0.00283,0.21,null,null,null],
        ["J1308-4650",null,1.05883304424,56,null,null,null],
        ["J1308-5844",null,0.46469974880009146,5.4,null,0.21,null],
        ["J1309-6415",null,0.6194535567595791,26,null,0.21,null],
        ["J1309-6526",null,0.39829216279,7,null,0.15,null],
        ["J1310-63",null,0.18566668,6.1,null,0.06,null],
        ["J1311-1228","B1309-12",0.4475178450619975,6.1,4,0.5,null],
        ["J1311-3430",null,0.002560371031671994,null,null,null,0.06],
        ["J1312+0051",null,0.0042280189916604,0.4,null,0.19,null],
        ["J1312+1810A","B1310+18",0.033163166,3,1,null,null],
        ["J1312+1810B",null,0.006242262892858796,null,null,null,null],
        ["J1312+1810C",null,0.012535079305261572,null,null,null,null],
        ["J1312+1810D",null,0.006069737409939856,null,null,null,null],
        ["J1312+1810E",null,0.003972138999586995,null,null,null,null],
        ["J1312-5402","B1309-53",0.7281543942054414,26,15,0.78,null],
        ["J1312-5516","B1309-55",0.8492425970196725,18,16,3.04,null],
        ["J1312-6400",null,2.4374330075384605,24,null,0.75,null],
        ["J1313+0931",null,0.8489327886610647,29,3.5,0.16,null],
        ["J1314-6101",null,2.9483896038,59,null,0.41,null],
        ["J1316-6147",null,1.9326,null,null,null,null],
        ["J1316-6232",null,0.34282539844,119,null,0.74,null],
        ["J1317-0157",null,0.0029082445995485145,0.29,null,null,null],
        ["J1317-5759",null,2.6421985132,12,null,null,null],
        ["J1317-6302",null,0.26127055606486,12,null,1.6,null],
        ["J1319-6056","B1316-60",0.2843529137967366,5,null,1.3,null],
        ["J1319-6105",null,0.421118114249,12,null,0.84,null],
        ["J1320+67",null,1.02862,12,1.4,null,null],
        ["J1320-3512",null,0.4584884145454337,10,7,4.7,null],
        ["J1320-5359","B1317-53",0.27973768328216575,7.9,18,2.1,null],
        ["J1321+8323","B1322+83",0.670037418385785,19.6,11,0.9,null],
        ["J1321-5922",null,1.27905759523,10,null,0.19,null],
        ["J1322-62",null,1.044851,null,null,0.3,null],
        ["J1322-6241",null,0.5060584137338984,5.9,null,0.37,null],
        ["J1322-6329",null,2.7642094208,34,null,0.17,null],
        ["J1324-6146",null,0.8441085753,72,null,0.73,null],
        ["J1324-6302",null,2.483803693,18,null,0.23,null],
        ["J1325-6253",null,0.02896859323602,1.7,null,0.11,null],
        ["J1326+33",null,0.0415,1.1,null,null,null],
        ["J1326-4728A",null,0.004108786192190273,null,null,0.054,null],
        ["J1326-4728B",null,0.0047918691610140726,null,null,0.088,null],
        ["J1326-4728C",null,0.0068678596923287,null,null,0.031,null],
        ["J1326-4728D",null,0.004578833468410412,null,null,0.038,null],
        ["J1326-4728E",null,0.004207717040740599,null,null,0.033,null],
        ["J1326-5859","B1323-58",0.4779936127568716,6.5,120,18,null],
        ["J1326-6408","B1323-63",0.7926743697493799,7.8,18,1.9,null],
        ["J1326-6700","B1322-66",0.54301587729535,42,28,14,null],
        ["J1327+3423",null,0.04151270974047403,null,null,null,null],
        ["J1327-0755",null,0.0026779232392941063,0.15,null,0.19,null],
        ["J1327-6222","B1323-62",0.5299291867467958,9.8,135,21,null],
        ["J1327-6301","B1323-627",0.19648018584407648,5.4,null,4.2,null],
        ["J1327-6400",null,0.28067797416776713,6.6,null,0.21,null],
        ["J1328-4357","B1325-43",0.5327029454210568,11,18,4.4,null],
        ["J1328-4921","B1325-49",1.4787213559,10,11,0.82,null],
        ["J1328-62",null,0.52885764,18.6,null,0.08,null],
        ["J1328-6605",null,0.734367,null,null,null,null],
        ["J1329+13",null,null,null,null,null,null],
        ["J1329-6158",null,1.5652179638,31,null,0.22,null],
        ["J1331-5245",null,0.6481166471,29,null,0.3,null],
        ["J1332-03",null,1.1064,null,null,null,null],
        ["J1332-3032",null,0.6504344906472496,35,9,0.3,null],
        ["J1333-4449",null,0.345602948594,1.7,null,0.3,null],
        ["J1333-61",null,1.532135,21,null,0.07,null],
        ["J1334+1005",null,0.9110921622859881,18,null,null,null],
        ["J1334-5839",null,0.10771823703851582,4.2,18,0.62,null],
        ["J1335-3642",null,0.399192,11,10,0.27,null],
        ["J1335-5656",null,0.003237712879621835,null,null,null,null],
        ["J1336+3414",null,1.5066032685306214,null,null,null,null],
        ["J1336-2522",null,0.4781454828,12,null,null,null],
        ["J1337-4441",null,1.2575114925970665,77,null,1.5,null],
        ["J1337-6306",null,0.20795301218897672,10,null,0.11,null],
        ["J1337-6423",null,0.009423406717797506,0.73,null,0.273,null],
        ["J1338-6204","B1334-61",1.2390027421608671,76,null,5.9,null],
        ["J1338-6425",null,0.0040877977,null,null,null,null],
        ["J1339-4712",null,0.13705466032634833,2.3,null,0.7,null],
        ["J1339-6618",null,0.55817922185,25,null,0.23,null],
        ["J1340-6456","B1336-64",0.3786289845463553,12,9,0.9,null],
        ["J1341-6023",null,0.6272990397264606,6.7,null,0.63,null],
        ["J1341-6220","B1338-62",0.19333974630573697,8.7,null,2.7,null],
        ["J1342+2822A",null,0.002544738383895283,0.24,null,0.007,null],
        ["J1342+2822B",null,0.002389420757786,0.2,null,0.014,null],
        ["J1342+2822C",null,0.002166,0.24,null,0.006,null],
        ["J1342+2822D",null,0.005442975173773786,0.5,null,0.01,null],
        ["J1342+2822E",null,0.00547,null,null,null,null],
        ["J1342+2822F",null,0.0044,null,null,null,null],
        ["J1343+6634",null,1.39410378554,57,null,null,null],
        ["J1344-5855",null,0.252397929468,13,null,0.138,null],
        ["J1344-6059",null,0.5401023214,29,null,0.19,null],
        ["J1345-6115",null,1.253086931080839,27,null,0.59,null],
        ["J1346-4918",null,0.29962512455918994,9.9,null,0.5,null],
        ["J1347-5947",null,0.6099716730113625,11,null,0.67,null],
        ["J1348-62",null,0.616257,145,null,0.14,null],
        ["J1348-6307",null,0.9277722388981355,79,null,0.51,null],
        ["J1349-6130",null,0.2593647641018986,5.3,null,0.76,null],
        ["J1349-63",null,0.373034,23,null,null,null],
        ["J1350-5115",null,0.29569970634618814,4,9,1.27,null],
        ["J1350-6225",null,0.1381577782127541,null,null,null,null],
        ["J1352-6141",null,0.0047383371,null,null,null,null],
        ["J1352-6803",null,0.628903384365165,28,null,1,null],
        ["J1353-6341",null,2.0762,null,null,null,null],
        ["J1354+2453",null,0.8510639078736152,null,null,null,null],
        ["J1354+2454",null,0.8508,278.6,null,null,null],
        ["J1354-6249",null,2.951938334,57,null,0.24,null],
        ["J1355-5153","B1352-51",0.6443045081669496,5,12,0.855,null],
        ["J1355-5747",null,2.0386738254187833,29,null,0.36,null],
        ["J1355-5925",null,1.2133852252449062,20,null,0.55,null],
        ["J1355-6206",null,0.27660304315,22,null,0.54,null],
        ["J1356-5521",null,0.5073802238091732,16,12,0.9,null],
        ["J1356-6230","B1353-62",0.455761,18.2,null,13,null],
        ["J1357-2530",null,0.912971,35,6,0.15,null],
        ["J1357-6429",null,0.16630802362022878,16,null,0.52,null],
        ["J1358-59",null,0.37411984,11.7,null,0.08,null],
        ["J1358-6025",null,0.06053268765133172,null,null,null,null],
        ["J1359-6038","B1356-60",0.1275094530195676,2.7,105,12.5,null],
        ["J1359-6242",null,0.899747,null,null,null,null],
        ["J1400+2127",null,1.855464924838742,null,null,null,null],
        ["J1400-1431",null,0.00308423326039194,0.22,null,0.17,null],
        ["J1400-6325",null,0.0311816011,null,null,0.25,null],
        ["J1401-6357","B1358-63",0.8428053217935702,9.1,34,7.1,null],
        ["J1402+1306",null,0.0058924086360281035,null,null,null,null],
        ["J1402-5021","B1359-51",1.380182295,30,10,null,null],
        ["J1403-0314",null,0.362634,null,null,null,null],
        ["J1403-6310",null,0.39917024384684624,17,null,0.65,null],
        ["J1403-7646",null,1.3061988506936013,17,4,0.8,null],
        ["J1404+1159",null,2.65043929892,35,2.7,0.28,null],
        ["J1405-4656",null,0.00760220343251,null,null,0.31,null],
        ["J1405-5641",null,0.6175746851424614,4.8,null,0.1,null],
        ["J1406-4233",null,2.4367954315909017,45,null,0.23,null],
        ["J1406-5806",null,0.288349655182362,49,null,0.84,null],
        ["J1406-59",null,1.248312,24,null,0.05,null],
        ["J1406-6121",null,0.21307465377616594,13,null,0.44,null],
        ["J1407-6048",null,0.4923442066385662,22,null,0.2,null],
        ["J1407-6153",null,0.7016149492255294,57,null,0.36,null],
        ["J1408+4944_P",null,1.1208923039048755,null,null,20,null],
        ["J1408-6009",null,0.567635,null,null,null,null],
        ["J1409+49",null,1.125,null,null,null,null],
        ["J1409-6011",null,0.3005806,null,null,null,null],
        ["J1409-6953",null,0.5285907792,23,null,0.3,null],
        ["J1410-6132",null,0.0500519462,17,null,1.9,null],
        ["J1410-7404",null,0.2787294526141525,1.4,null,1.2,null],
        ["J1411+2551",null,0.06245289551759,2.7,null,null,null],
        ["J1412+7922",null,0.05819907107,null,null,null,null],
        ["J1412-6111",null,0.5291577804692954,11,null,0.44,null],
        ["J1412-6145",null,0.3152584333739297,12,null,0.69,null],
        ["J1413-5936",null,0.02167625,null,null,null,null],
        ["J1413-6141",null,0.28562462018,13,null,0.82,null],
        ["J1413-6205",null,0.10974069968815943,null,null,null,null],
        ["J1413-6222",null,0.29240770249251397,23,null,0.96,null],
        ["J1413-6307","B1409-62",0.3949528848671108,3.5,null,1.2,null],
        ["J1414-6802",null,4.6301880619,118,null,0.65,null],
        ["J1415-6621",null,0.3924793799001631,6.9,null,0.5,null],
        ["J1416-5033",null,0.794882546,13.9,null,0.1,null],
        ["J1416-6037",null,0.2955835864299678,13,null,0.7,null],
        ["J1417-4402",null,0.002664216,null,null,null,null],
        ["J1418-3921",null,1.0968068179434953,20.4,24,0.95,null],
        ["J1418-5945",null,1.6725956812,64,null,0.18,null],
        ["J1418-6058",null,0.11057301169006639,null,null,null,null],
        ["J1420-5416","B1417-54",0.935772204694025,21,9,0.79,null],
        ["J1420-5625",null,0.03411713084786256,1.3,null,0.121,null],
        ["J1420-6048",null,0.06817987659,8.5,null,1.19,null],
        ["J1421-4409",null,0.0063857288383424,0.22,null,1.26,null],
        ["J1422-6138",null,0.34096785164255006,null,null,null,null],
        ["J1423-62",null,1.671473,66,null,0.05,null],
        ["J1423-6953",null,0.333410710172,1.6,null,0.362,null],
        ["J1424-5556",null,0.7703748458743364,22,null,0.38,null],
        ["J1424-56",null,1.427,7,null,null,null],
        ["J1424-5822",null,0.36673680209760523,10,null,1.3,null],
        ["J1424-6438",null,1.02350369913,70,null,0.24,null],
        ["J1425-5723",null,0.35326292024,6.6,null,0.24,null],
        ["J1425-5759",null,0.70786760576,7.6,null,0.09,null],
        ["J1425-6210",null,0.50173030986895,8.3,null,0.19,null],
        ["J1426+52",null,0.9958,10,null,null,null],
        ["J1426-6136",null,0.2837001,null,null,null,null],
        ["J1427+5211",null,0.9958640600266803,null,null,null,null],
        ["J1427-4158",null,0.586485556229,16,null,0.3,null],
        ["J1428-5530","B1424-55",0.57029274315259,13,35,7.67,null],
        ["J1429-5911",null,0.11584261007731625,null,null,null,null],
        ["J1429-5935",null,0.7639148305341594,12,null,0.11,null],
        ["J1430-5712",null,0.49151880358,10,null,0.092,null],
        ["J1430-6623","B1426-66",0.7854433453623382,3.8,130,16,null],
        ["J1431-4715",null,0.0020119534425332,null,null,0.67,null],
        ["J1431-5740",null,0.0041105439567658,0.176,null,0.359,null],
        ["J1431-6328",null,0.00277229565,0.83,null,null,null],
        ["J1432-5032",null,2.0349894792,36,null,0.3,null],
        ["J1433+00",null,null,3.8,null,null,null],
        ["J1433-6038",null,1.9544296353,46,null,0.23,null],
        ["J1434+7257",null,0.04174114787976419,1.9,1.3,null,null],
        ["J1434-5943",null,1.07212121207,42.9,null,0.17,null],
        ["J1434-6006",null,0.30636786268,4.5,null,0.24,null],
        ["J1434-6029",null,0.9633483231519261,19,null,0.14,null],
        ["J1435-5954",null,0.4729966255163412,18,null,1.6,null],
        ["J1435-60",null,3.26216598,76.5,null,0.07,null],
        ["J1435-6100",null,0.009347972210248112,1.1,null,0.313,null],
        ["J1436-6405",null,0.009332971,null,null,null,null],
        ["J1437+3049_P",null,0.003719227529790835,null,null,23,null],
        ["J1437-5959",null,0.0616961234035,4.33,null,0.075,null],
        ["J1437-6146",null,0.4676163234503246,16,null,0.24,null],
        ["J1437-62",null,0.777994,16.4,null,0.06,null],
        ["J1439+7655",null,0.947903,7,null,null,null],
        ["J1439-5501",null,0.02863488819045455,1.7,null,0.38,null],
        ["J1440-6344","B1436-63",0.45960672390058893,8.1,21,0.78,null],
        ["J1441-6137",null,1.1758400229,18,null,0.15,null],
        ["J1443-5122",null,0.7320614134218955,44,null,0.6,null],
        ["J1444+18",null,1.1326,null,null,null,null],
        ["J1444-5941",null,2.7602279448029736,47,null,0.42,null],
        ["J1444-6026",null,4.7585755679,21,null,null,null],
        ["J1445-63",null,0.00371866853,2.2,null,0.18,null],
        ["J1446-4701",null,0.0021946957808815955,0.1,null,0.46,null],
        ["J1447-5757",null,0.15873015873015872,null,null,null,null],
        ["J1449-5846",null,0.463329577191,21,null,0.28,null],
        ["J1449-6339",null,0.02946618,null,null,null,null],
        ["J1452-5549",null,0.0752527,null,null,null,null],
        ["J1452-5851",null,0.3866429281059257,9.1,null,0.33,null],
        ["J1452-6036",null,0.15499228767284257,1.8,null,1.9,1.36],
        ["J1453+1902",null,0.005792302738847545,0.3,2,0.16,null],
        ["J1453-6413","B1449-64",0.17948743248843946,3.2,230,18,null],
        ["J1454-5416",null,0.3964593,null,null,null,null],
        ["J1454-5846",null,0.045248772998032434,2.9,null,0.299,null],
        ["J1455-3330",null,0.007987204806683728,0.8,9,0.73,null],
        ["J1455-59",null,0.1761912,null,null,1.6,null],
        ["J1456-48",null,0.53681,null,null,null,null],
        ["J1456-6843","B1451-68",0.26337692665373175,13,350,64,null],
        ["J1457-5122","B1454-51",1.7483075052319141,14,4,1.382,null],
        ["J1457-5900",null,1.4986374368,62,null,0.24,null],
        ["J1457-5902",null,0.39073936418,7.2,null,0.26,null],
        ["J1459-6053",null,0.10315063827359058,null,null,null,null],
        ["J1500-6054",null,0.2136614,null,null,null,null],
        ["J1501-0046",null,0.464036813928,10.6,null,null,null],
        ["J1501-5637",null,0.7829485661,25,null,0.21,null],
        ["J1502+28",null,3.784,null,null,null,null],
        ["J1502+4653",null,1.752508063758967,29.08,null,null,null],
        ["J1502-5653",null,0.535505609654032,7.2,null,0.39,null],
        ["J1502-5828",null,0.66810515091,22,null,0.5,null],
        ["J1502-6128",null,0.8421042276292402,30,null,0.56,null],
        ["J1502-6752",null,0.026744423767002628,2.97,null,0.87,null],
        ["J1503+2111",null,3.31400150122,85.8,1.3,null,null],
        ["J1504-5621",null,0.41298519981,11,null,0.24,null],
        ["J1504-5659",null,1.67237234272,49,null,0.11,null],
        ["J1505-2524",null,0.999,11,null,null,null],
        ["J1506-5158","B1503-51",0.840738545,14,5,3.75,null],
        ["J1507-4352","B1504-43",0.28675875072636364,4.2,16,0.9,null],
        ["J1507-5800",null,0.897254102404,8.7,null,0.2,null],
        ["J1507-6640","B1503-66",0.3556564857733183,3.5,13,0.6,null],
        ["J1509+5531","B1508+55",0.739681922904263,10.9,114,8,null],
        ["J1509-5850",null,0.08892486294263222,3.4,null,0.21,null],
        ["J1509-6015",null,0.3390384487,13,null,0.17,null],
        ["J1510-4422","B1507-44",0.9438712975,50,14,null,null],
        ["J1510-5254",null,0.0047790328,null,null,null,null],
        ["J1511-5414",null,0.20038402179876424,4.3,null,0.75,null],
        ["J1511-5835",null,0.30151055002,19,null,0.5,null],
        ["J1512-5431",null,2.040532908461736,114,null,0.38,null],
        ["J1512-5759","B1508-57",0.12869857304743115,6,null,7.8,null],
        ["J1512-6029",null,0.2295951,null,null,null,null],
        ["J1513-2550",null,0.0021190675651177,null,null,0.308,null],
        ["J1513-5739",null,0.9734776671189312,19,null,0.77,null],
        ["J1513-5908","B1509-58",0.15158194339345915,16,1.5,1.43,null],
        ["J1513-5946",null,1.046117156733,15,null,null,null],
        ["J1513-6013",null,1.95873704232,35.3,null,0.2,null],
        ["J1514-4834","B1510-48",0.4548404836601318,3.5,8.5,1.3,null],
        ["J1514-4946",null,0.0035893366796749433,null,null,0.25,null],
        ["J1514-5316",null,0.296279212139,5.16,null,0.147,null],
        ["J1514-5925",null,0.14879746784564993,4.1,null,0.29,null],
        ["J1515+20",null,1.147,null,null,null,null],
        ["J1515-5720",null,0.2866482560809936,8.1,null,0.25,null],
        ["J1516-43",null,0.03602220870028557,null,null,null,null],
        ["J1517-313",null,0.1406677,null,0.6,null,null],
        ["J1517-314",null,1.1037264,null,0.4,null,null],
        ["J1517-32",null,0.0644019,2.3,null,null,null],
        ["J1517-4356",null,0.650837029081819,8.9,null,0.5,null],
        ["J1517-4636",null,0.8866132708442906,17,null,0.3,null],
        ["J1518+0204A","B1516+02A",0.005553592544011013,0.3,null,0.137,null],
        ["J1518+0204B","B1516+02B",0.007946940656271776,1.024,0.5,0.033,null],
        ["J1518+0204C",null,0.0024839275728361547,1.077,null,0.044,null],
        ["J1518+0204D",null,0.0029879763276464705,0.557,null,0.017,null],
        ["J1518+0204E",null,0.003182300350911386,0.875,null,0.022,null],
        ["J1518+0204F",null,0.002654191797482777,1.711,null,0.012,null],
        ["J1518+0204G",null,0.0027501867888584186,0.133,null,0.008,null],
        ["J1518+4904",null,0.04093498890833287,1.42,8,4,null],
        ["J1518-0627",null,0.79499667457,7.8,null,null,null],
        ["J1518-3952",null,0.4991959510298456,7.8,null,0.9,null],
        ["J1518-5415",null,0.214924800284,2.7,null,0.08,null],
        ["J1518-60",null,0.5106556,24,null,0.1,null],
        ["J1519-5734",null,0.5187577847442734,54,null,0.45,null],
        ["J1519-6106",null,2.1543070606364485,21,null,0.19,null],
        ["J1519-6308",null,1.2540519522896627,17,null,0.32,null],
        ["J1520-5402",null,0.2706992,null,null,null,null],
        ["J1521-57",null,0.17368169,5.8,null,0.07,null],
        ["J1522-5525",null,1.3896046876,5.4,null,0.25,null],
        ["J1522-5735",null,0.1021359808701179,null,null,null,null],
        ["J1522-5829","B1518-58",0.3953548079809999,15,null,6,null],
        ["J1523-3235",null,1.5048345580049638,93,null,0.2,null],
        ["J1524-5625",null,0.07824399024276046,3.6,null,1.28,null],
        ["J1524-5706",null,1.116174457166813,17,null,0.45,null],
        ["J1524-5819",null,0.96104262694,9.4,null,0.09,null],
        ["J1525-5417",null,1.01169421772,5.9,null,0.18,null],
        ["J1525-5523",null,0.3551560369998,31,null,0.21,null],
        ["J1525-5545",null,0.011359881791767347,0.54,null,0.426,null],
        ["J1525-5605",null,0.28034866206,27,null,0.25,null],
        ["J1526-2744",null,0.002489143587193874,null,null,null,null],
        ["J1526-5633",null,0.30188789663,13,null,0.11,null],
        ["J1526-5652",null,0.848913,null,null,null,null],
        ["J1527-3931","B1524-39",2.417605394365937,40,11,null,null],
        ["J1527-5552","B1523-55",1.048720321818809,10,17,0.84,null],
        ["J1528-3146",null,0.060822231369657496,0.4,null,0.4,null],
        ["J1528-4109",null,0.5265564183598378,8.7,null,0.6,null],
        ["J1528-5547",null,3.467301517,52.9,null,0.07,null],
        ["J1528-5838",null,0.35568662209716684,null,null,null,null],
        ["J1529+4050",null,0.47641843207784396,47.1,null,null,null],
        ["J1529-26",null,0.799,21,null,null,null],
        ["J1529-3828",null,0.008486282115739591,1.23,null,0.27,null],
        ["J1529-5102",null,1.268454,null,null,null,null],
        ["J1529-5355",null,0.8912645399,56,null,0.37,null],
        ["J1529-5609",null,0.03603232,null,null,null,null],
        ["J1529-5611",null,0.8222487311,42,null,0.14,null],
        ["J1530-2114",null,0.505,12,null,null,null],
        ["J1530-5327",null,0.27896001991585656,8.7,null,0.92,null],
        ["J1530-5724",null,0.56803,null,null,null,null],
        ["J1530-6343",null,0.9103198224413934,8,null,0.37,null],
        ["J1531-4012",null,0.35684938398949206,7.7,null,0.4,null],
        ["J1531-5610",null,0.08421093929385198,1.7,null,0.87,null],
        ["J1532+2745","B1530+27",1.1248357427665205,30.2,13,0.8,null],
        ["J1532-5308",null,0.4438246083,26,null,0.25,null],
        ["J1532-56",null,0.52297708597,27,null,0.1,null],
        ["J1534-4428",null,1.221426042080443,11.9,null,0.7,null],
        ["J1534-46",null,0.364835,null,null,null,null],
        ["J1534-5334","B1530-53",1.3688824859921243,15,70,6.8,null],
        ["J1534-5405","B1530-539",0.2896903793784727,4.5,null,1.4,null],
        ["J1535-4114",null,0.43286892152332024,15,null,2.9,null],
        ["J1535-4415",null,0.46840160422,82,null,null,null],
        ["J1535-5450",null,0.56673415672,9.4,null,0.17,null],
        ["J1535-5848",null,0.3071794647036714,5.4,null,0.35,null],
        ["J1536+17",null,0.9333,20,null,null,null],
        ["J1536-30",null,1.901,14,null,null,null],
        ["J1536-3602",null,1.3197594989949515,83,null,1.9,null],
        ["J1536-4948",null,0.0030799140584053327,null,null,0.087,null],
        ["J1536-5433",null,0.881438431123562,33.5,null,1.8,null],
        ["J1536-5907",null,0.55784066031,13,null,0.22,null],
        ["J1536-6142",null,0.369501,null,null,null,null],
        ["J1536-6149",null,0.006875163,null,null,null,null],
        ["J1537+1155","B1534+12",0.037904441178304625,1.4,36,0.46,null],
        ["J1537-4912",null,0.3013118508870651,6.5,null,0.31,null],
        ["J1537-5153",null,1.52812410566,34,null,0.07,null],
        ["J1537-5312",null,0.0069270955083835,1.84,null,0.458,null],
        ["J1537-5645",null,0.43046412386182137,67,null,1,null],
        ["J1537-61",null,0.3695015,8.7,null,0.08,null],
        ["J1538+2345",null,3.4493849533157874,33.7,null,null,null],
        ["J1538-5438",null,0.2767261372601285,12,null,0.24,null],
        ["J1538-5519",null,0.39573063893,86,null,0.42,null],
        ["J1538-5551",null,0.10467590196189355,8.1,null,0.33,null],
        ["J1538-5621",null,1.90849449143,34.1,null,0.14,null],
        ["J1538-5638",null,0.84398039688,46,null,0.28,null],
        ["J1538-5732",null,0.3412157952248712,5,null,0.35,null],
        ["J1538-5750",null,0.506568335296,5.4,null,0.06,null],
        ["J1539-4828",null,1.27284159978,20,null,0.2,null],
        ["J1539-5521",null,1.00495831813,15,null,0.14,null],
        ["J1539-5626","B1535-56",0.24339515084566335,8.8,null,5,null],
        ["J1539-6322",null,1.63084630957,67,null,null,null],
        ["J1540-5736",null,0.6129162856930118,14,null,0.24,null],
        ["J1540-5821",null,3.47472,null,null,null,null],
        ["J1541+4703",null,0.27770069289356564,null,null,null,null],
        ["J1541-42",null,null,4,null,null,null],
        ["J1541-5535",null,0.29583755345,4.9,null,0.3,null],
        ["J1542-5034",null,0.5992486270661561,4.7,21,0.3,null],
        ["J1542-5133",null,1.7838649876987605,35,null,0.27,null],
        ["J1542-5303",null,1.2076209283621493,52,null,0.35,null],
        ["J1543+0929","B1541+09",0.7484488274633482,146,78,5.9,null],
        ["J1543-0620","B1540-06",0.709064837188539,7.6,40,2,null],
        ["J1543-5013",null,0.6442550645,17,null,0.17,null],
        ["J1543-5149",null,0.002056960397500528,0.27,null,0.82,null],
        ["J1543-5439",null,0.0043123052,null,null,null,null],
        ["J1543-5459",null,0.37713777811030136,14,null,0.81,null],
        ["J1544+4937",null,0.002159288390424757,0.1,5.4,null,null],
        ["J1544-0713",null,0.48412980319437554,6.1,null,0.39,null],
        ["J1544-2555",null,0.0023900671488874146,null,null,null,null],
        ["J1544-5308","B1541-52",0.1785538850981586,3.1,23,5.82,null],
        ["J1545-4550",null,0.0035752886234746224,0.128,null,1.07,null],
        ["J1546-3747A",null,0.0026056722466,null,null,null,null],
        ["J1546-5302",null,0.580848060173689,9.1,null,0.32,null],
        ["J1546-5925",null,0.007796728856036,0.67,null,0.269,null],
        ["J1547-0944",null,1.57692463294,30,null,null,null],
        ["J1547-5056",null,0.452782,null,null,null,null],
        ["J1547-5709",null,0.0042911460641714,0.149,null,0.343,null],
        ["J1547-5750",null,0.6471977466557735,42,null,0.23,null],
        ["J1547-5839",null,0.2421907119153731,13,null,0.41,null],
        ["J1548-4821",null,0.14565472182060252,10,null,0.51,null],
        ["J1548-4927",null,0.6027407866088303,11,null,0.69,null],
        ["J1548-55",null,0.5413823,42.5,null,0.08,null],
        ["J1548-5607",null,0.1709416575596888,5.8,null,1.39,null],
        ["J1549+2113",null,1.262471311613,17.9,0.9,null,null],
        ["J1549-4848",null,0.2883549019075376,5.9,17,1.6,null],
        ["J1549-5337",null,0.00331670955,0.4,null,0.24,null],
        ["J1549-57",null,0.7375,4,null,null,null],
        ["J1549-5722",null,0.497772394,16,null,0.1,null],
        ["J1550-5242",null,0.7496713392678518,12,null,0.32,null],
        ["J1550-5317",null,1.42112434544,85,null,0.4,null],
        ["J1550-5418",null,2.06983302,null,null,4,5.3],
        ["J1551-0658",null,0.00709375570886,null,0.5,null,null],
        ["J1551-4424",null,0.6740604383380003,28,null,1,null],
        ["J1551-5310",null,0.45344775275593824,38,null,0.72,null],
        ["J1551-6214",null,0.198838610773352,2.5,null,0.312,null],
        ["J1552+5437",null,0.0024278884863578832,null,null,null,null],
        ["J1552-4937",null,0.0062843113814174,0.9,null,0.34,null],
        ["J1553-5456","B1550-54",1.0813471469557479,8.4,13,0.9,null],
        ["J1554+18",null,null,7.6,null,null,null],
        ["J1554-4854",null,0.4647786,null,null,null,null],
        ["J1554-5209",null,0.1252295584025,21,null,null,null],
        ["J1554-5512",null,3.418039313,63,null,0.11,null],
        ["J1554-5906",null,0.008702148,null,null,null,null],
        ["J1555+01",null,null,null,null,null,null],
        ["J1555-0515",null,0.97540989108,13,null,null,null],
        ["J1555-2341","B1552-23",0.5325783201179226,13,7.6,0.9,null],
        ["J1555-2908",null,0.001787501766969385,null,null,0.2,null],
        ["J1555-3134","B1552-31",0.518109779800833,28,19,4.24,null],
        ["J1555-53",null,1.170896,103,null,0.17,null],
        ["J1556-52",null,1.17089353,86.9,null,0.2,null],
        ["J1556-5358",null,0.99468068673,29,null,0.53,null],
        ["J1557-4258",null,0.3291871874393292,4.2,40,3.14,null],
        ["J1557-5151",null,0.408154708451,28.9,null,0.31,null],
        ["J1557-54",null,0.58375842,127.7,null,0.32,null],
        ["J1558-5419",null,0.5945752635482934,22,null,0.4,null],
        ["J1558-5756",null,1.1223416862753752,5.5,null,0.19,null],
        ["J1558-67",null,0.267268,null,null,null,null],
        ["J1559-44",null,1.16989,null,null,null,null],
        ["J1559-4438","B1556-44",0.25705721188910935,6.3,110,37,null],
        ["J1559-55",null,1.300737,19,null,0.04,null],
        ["J1559-5545","B1555-55",0.9572668393386173,9,15,0.72,null],
        ["J1600-3053",null,0.003597928510587011,0.094,null,2.44,null],
        ["J1600-49",null,0.2875261,24,null,0.1,null],
        ["J1600-5044","B1557-50",0.19260568997910202,4.9,null,21,null],
        ["J1600-5751","B1556-57",0.19445589391970322,9.9,20,2.5,null],
        ["J1600-5916",null,1.2476661740144739,127,null,0.33,null],
        ["J1601-50",null,0.860777,null,null,0.4,null],
        ["J1601-5244",null,2.55935663097759,62,null,0.13,null],
        ["J1601-5335",null,0.288479334214096,7,null,0.25,null],
        ["J1602+3901",null,0.003708,null,null,null,null],
        ["J1602-1009",null,0.0031157772059381018,null,null,null,null],
        ["J1602-4957",null,0.81999003685,29,null,0.17,null],
        ["J1602-5100","B1558-50",0.8642970272517039,4.2,45,8.23,null],
        ["J1603+18",null,0.503,8.8,null,null,null],
        ["J1603-1655",null,0.7147,null,null,null,null],
        ["J1603-2531",null,0.28307132309216326,5.8,15,4.98,null],
        ["J1603-2712","B1600-27",0.7783156720350001,16,20,1.7,null],
        ["J1603-3539",null,0.1419086745023643,11,null,0.9,null],
        ["J1603-5312",null,0.83922081265,24.4,null,0.25,null],
        ["J1603-54",null,0.960792,20,null,0.07,null],
        ["J1603-5657",null,0.49607951018613516,3.4,8,0.93,null],
        ["J1603-7202",null,0.014841952252617327,1.206,21,2.46,null],
        ["J1604-0057",null,1.675869311235312,null,null,null,null],
        ["J1604-3142",null,0.8838904540050438,7.8,null,0.37,null],
        ["J1604-44",null,1.3892,null,null,null,null],
        ["J1604-4718",null,0.5274658742113556,11,null,0.22,null],
        ["J1604-4832",null,0.007718008,null,null,null,null],
        ["J1604-4909","B1600-49",0.3274185215590687,3.8,44,6.1,null],
        ["J1604-7203",null,0.341402932218,25,10,null,null],
        ["J1605+3249",null,6.88,null,null,null,null],
        ["J1605-52",null,2.193373,31,null,0.07,null],
        ["J1605-5215",null,1.01360874732883,26,null,0.22,null],
        ["J1605-5228",null,2.193373,null,null,null,null],
        ["J1605-5257","B1601-52",0.658013462449232,60,30,21,null],
        ["J1607-0032","B1604-00",0.42181623358257625,9.9,54,1.7,null],
        ["J1607-5140",null,0.34272279246736675,20,null,0.26,null],
        ["J1607-6449",null,0.298116357616,3.5,null,0.22,null],
        ["J1609-1930",null,1.55791724762,13.8,null,0.3,null],
        ["J1609-4616",null,0.24960927260087024,3.9,null,0.38,null],
        ["J1609-5158",null,1.2794023539452164,100,null,0.27,null],
        ["J1610-1322","B1607-13",1.0183927463615343,37.6,16,1.11,null],
        ["J1610-17",null,null,null,null,null,null],
        ["J1610-4938",null,0.2274187,null,null,null,null],
        ["J1610-5006",null,0.48111885214580963,48,null,1.6,null],
        ["J1610-5303",null,0.78646802352,44,null,0.76,null],
        ["J1611-01",null,1.29687,null,null,null,null],
        ["J1611-0114",null,2.5937255578208425,null,null,0.026,null],
        ["J1611-29",null,0.0096,0.52,null,null,null],
        ["J1611-4811",null,1.296850239,33,null,0.08,null],
        ["J1611-4949",null,0.6664383124808082,21,null,0.58,null],
        ["J1611-5209","B1607-52",0.18249480209038968,1.2,null,1.45,null],
        ["J1611-5847",null,0.35455031664636466,2.1,null,0.11,null],
        ["J1612+2008",null,0.4266459810253,6,null,null,null],
        ["J1612-2408",null,0.92383371069,7.2,null,0.5,null],
        ["J1612-49",null,0.19268718417,28.7,null,0.16,null],
        ["J1612-5022",null,1.36828292337,15.2,null,0.23,null],
        ["J1612-5136",null,0.48331051132,125,null,0.2,null],
        ["J1612-53",null,0.73212065,80.1,null,0.16,null],
        ["J1612-55",null,0.846907,37.6,null,0.11,null],
        ["J1612-5805",null,0.6155208312838791,4.8,null,0.3,null],
        ["J1613-4714","B1609-47",0.38237682615511803,9.3,17,1.4,null],
        ["J1613-5211",null,0.457515655818516,11,null,0.29,null],
        ["J1613-5234",null,0.6552205956723225,31,null,0.28,null],
        ["J1614+0737","B1612+07",1.2068033926375523,18.3,9.6,0.6,null],
        ["J1614-2230",null,0.0031508076556906726,0.3,null,1.14,null],
        ["J1614-2318",null,0.03350360003988533,2,null,null,null],
        ["J1614-3846",null,0.46410631422,24.471,null,0.182,null],
        ["J1614-3937",null,0.4072924230915118,16,12,0.7,null],
        ["J1614-4608",null,0.888793,null,null,null,null],
        ["J1614-5048","B1610-50",0.23169383623008438,8.4,null,4.1,null],
        ["J1614-5144",null,1.5340081422,68,null,0.16,null],
        ["J1614-52",null,0.5099027,114,null,0.1,null],
        ["J1614-5402",null,0.57259227192,14,null,0.25,null],
        ["J1615-2940","B1612-29",2.477567873840917,25.7,3.1,null,null],
        ["J1615-4958",null,0.55825750561,9.13,null,0.158,null],
        ["J1615-5137",null,0.17927778068294223,null,null,null,null],
        ["J1615-5444",null,0.360957675308,4.9,null,0.59,null],
        ["J1615-5537","B1611-55",0.7915276250727622,3.9,12,0.8,null],
        ["J1615-5609",null,0.00335913,null,null,null,null],
        ["J1616-5017",null,0.49138412183,6.7,null,0.17,null],
        ["J1616-5109",null,1.219593882479083,220,null,1.2,null],
        ["J1616-5208",null,1.0258308926302258,43,null,0.44,null],
        ["J1617+1123",null,0.8949243019981865,null,null,0.141,null],
        ["J1617-2258A",null,0.004318310834922721,null,null,null,null],
        ["J1617-4216",null,3.4284787258172216,30,null,0.28,null],
        ["J1617-4608",null,0.5670802217208082,6.6,null,0.15,null],
        ["J1617-5055",null,0.069356847,8.6,null,0.27,null],
        ["J1618-36",null,0.005778747,null,null,null,null],
        ["J1618-3921",null,0.011987308413426887,1.4,null,0.631,null],
        ["J1618-42",null,1.86713635,65.6,null,0.09,null],
        ["J1618-4624",null,0.005931367495281,0.291,null,0.229,null],
        ["J1618-4723",null,0.4071086198517084,11,null,1,null],
        ["J1619+3953",null,1.8837978656269263,null,null,0.005,null],
        ["J1619-3345",null,1.1586,null,null,null,null],
        ["J1619-42",null,1.023152,null,null,0.6,null],
        ["J1620-4927",null,0.1719346524466338,null,null,null,null],
        ["J1620-5414",null,1.1563602878201713,26,null,0.13,null],
        ["J1621-5039",null,1.0840293253315716,20,null,0.36,null],
        ["J1621-5243",null,0.3719246646169182,18,null,0.27,null],
        ["J1622-0315",null,0.0038454290679360036,null,null,null,null],
        ["J1622-3751",null,0.7314627228,25,null,0.2,null],
        ["J1622-4332",null,0.9169389313588406,30,16,0.53,null],
        ["J1622-4347",null,0.4576814710404071,10,null,0.18,null],
        ["J1622-4802",null,0.2650724667660084,18,null,0.92,null],
        ["J1622-4845",null,0.73509164794,17.5,null,0.15,null],
        ["J1622-4944",null,1.072967894203272,34,null,0.52,null],
        ["J1622-4950",null,4.327020260966019,null,null,4.8,null],
        ["J1622-6617",null,0.02362344473939201,0.78,null,0.44,null],
        ["J1623-0841",null,0.5030150056,10,null,null,null],
        ["J1623-0908","B1620-09",1.276448221655844,10,6,0.6,null],
        ["J1623-2631","B1620-26",0.011075750914202482,0.57,15,1.6,null],
        ["J1623-4256","B1620-42",0.3645914978350675,9.6,24,2.6,null],
        ["J1623-4608",null,0.866306,null,null,null,null],
        ["J1623-4931",null,0.492347,null,null,null,null],
        ["J1623-4949",null,0.7257624023435872,11,null,0.36,null],
        ["J1623-5005",null,0.0850721461633878,null,null,null,null],
        ["J1623-6936",null,0.002409872994584688,null,null,null,null],
        ["J1624+5850",null,0.65180081878,14.8,null,null,null],
        ["J1624+8643",null,0.39576302203831243,6,null,null,null],
        ["J1624-39",null,0.00296,null,null,null,null],
        ["J1624-4041",null,0.16786114514778336,null,null,null,null],
        ["J1624-4411",null,0.23316451809686695,7.7,null,0.48,null],
        ["J1624-4613",null,0.871242605551968,168,null,0.39,null],
        ["J1624-4721",null,0.44872324857,18,null,0.15,null],
        ["J1625-0021",null,0.002833613877223395,null,null,null,null],
        ["J1625-4048",null,2.3552781933,83,17,null,null],
        ["J1625-4904",null,0.4603394922883185,15,null,0.2,null],
        ["J1625-4913",null,0.35585626277,12,null,0.2,null],
        ["J1626-44",null,0.3083536,null,null,0.3,null],
        ["J1626-4537",null,0.37014666000757174,12,null,1.2,null],
        ["J1626-4807",null,0.2939281886424272,62.5,null,0.37,null],
        ["J1626-6621",null,0.45086776633,3.1,null,0.2,null],
        ["J1627+1419",null,0.49085681819810145,41,6.1,null,null],
        ["J1627+3219",null,0.0021828338203418334,null,null,null,null],
        ["J1627-4706",null,0.14074580605302295,9.3,null,0.18,null],
        ["J1627-4845",null,0.612330650088,36,null,0.48,null],
        ["J1627-49",null,0.623678,69.3,null,0.13,null],
        ["J1627-51",null,0.439684,9.8,null,0.08,null],
        ["J1627-5547",null,0.35246471753212755,13,null,0.65,null],
        ["J1627-5936",null,0.3542339488457276,87,null,1.6,null],
        ["J1628+4406",null,0.18117848994714758,99.9,3.2,null,null],
        ["J1628-3205",null,0.003211568331468424,null,null,null,null],
        ["J1628-46",null,0.4494389,20,null,0.07,null],
        ["J1628-4804",null,0.8659709627039299,39,null,1.2,null],
        ["J1628-4828",null,4.1375385239,240,null,0.29,null],
        ["J1629+33",null,1.525,43,null,null,null],
        ["J1629+4636",null,0.314056114549,null,null,null,null],
        ["J1629-3636",null,2.988192686,11.6,null,0.2,null],
        ["J1629-3825",null,0.526364702596562,7.7,null,0.383,null],
        ["J1629-6902",null,0.0060006034432179,0.4,null,1.01,null],
        ["J1630+3550",null,0.0032291563373148652,0.5,null,null,null],
        ["J1630+3734",null,0.00331811218167957,0.4,null,null,null],
        ["J1630-2609",null,1.912419751292923,52,null,0.42,null],
        ["J1630-4719",null,0.5590812212694896,8.7,null,0.46,null],
        ["J1630-4733","B1626-47",0.57597141155,82.7,null,10,null],
        ["J1631+1252",null,0.31018591147467345,null,null,0.43,null],
        ["J1631-1612",null,0.67768391249,null,null,null,null],
        ["J1631-4155",null,0.5512412537678835,14,null,0.19,null],
        ["J1631-47",null,1.103326,51,null,0.1,null],
        ["J1631-4722",null,0.1187192580211365,null,null,null,null],
        ["J1632-1013",null,0.71763732795,18,null,0.15,null],
        ["J1632-4509",null,1.0468098769434582,18,null,0.16,null],
        ["J1632-4621",null,1.709207748695423,17,null,0.8,null],
        ["J1632-4757",null,0.2285686729542992,17,null,0.51,null],
        ["J1632-4818",null,0.8136719864000859,52,null,0.48,null],
        ["J1632-49",null,0.4168363,67,null,0.17,null],
        ["J1633-2009",null,0.93555704483,32.2,null,null,null],
        ["J1633-4453","B1630-44",0.436506697158,8.9,null,2.76,null],
        ["J1633-4805",null,0.7108300788,48,null,0.23,null],
        ["J1633-4859",null,2.51478,null,null,null,null],
        ["J1633-5015","B1629-50",0.35214540393808125,8.3,null,7.6,null],
        ["J1634+02",null,0.00212,null,null,null,null],
        ["J1634-4229",null,2.01526299651,15,null,0.16,null],
        ["J1634-49",null,0.68493649236,9.7,null,0.1,null],
        ["J1634-495",null,0.3567154,null,null,null,null],
        ["J1634-5107",null,0.507356002673836,14,null,0.05,null],
        ["J1634-5640",null,0.2242012102704704,8.1,null,0.3,null],
        ["J1635+2332",null,1.2086942458,46.6,0.4,null,null],
        ["J1635+2418","B1633+24",0.4905065128003319,16.8,9.1,0.4,null],
        ["J1635-1511",null,1.17938703902,34.4,null,0.5,null],
        ["J1635-4513",null,1.5947455499,75,null,0.25,null],
        ["J1635-46",null,1.488903,31,null,0.12,null],
        ["J1635-47",null,0.50483063,124.2,null,0.29,null],
        ["J1635-4735",null,2.594578,null,null,null,null],
        ["J1635-4944",null,0.67196419932,47,null,0.4,null],
        ["J1635-5954","B1630-59",0.5291231364449406,25,7,1.8,null],
        ["J1636-2614",null,0.51045375561,7,null,0.19,null],
        ["J1636-4217",null,0.555086,null,null,null,null],
        ["J1636-4440",null,0.20664850874,11,null,0.29,null],
        ["J1636-4803",null,1.2046438889,44,null,1.1,null],
        ["J1636-4933",null,0.430366558,17,null,0.45,null],
        ["J1636-51",null,0.34010646,12,null,0.09,null],
        ["J1637-4335",null,0.77136654042,40,null,0.18,null],
        ["J1637-4450",null,0.2528701539747145,15,null,0.4,null],
        ["J1637-4553","B1634-45",0.1187744367268514,3.4,15,1.5,null],
        ["J1637-46",null,0.493091,null,null,0.7,null],
        ["J1637-4642",null,0.1540664111624651,15,null,0.93,null],
        ["J1637-4721",null,1.1657413866,21,null,0.42,null],
        ["J1637-4816",null,0.8373653018,67,null,0.74,null],
        ["J1638+4005",null,0.76772039193,12.6,null,null,null],
        ["J1638-35",null,0.705,10,null,null,null],
        ["J1638-3815",null,0.6982606597852877,55,null,0.67,null],
        ["J1638-3951",null,0.77113024025,19,null,0.21,null],
        ["J1638-4233",null,0.51092936864,18,null,0.35,null],
        ["J1638-4344",null,1.12194419355,41,null,0.17,null],
        ["J1638-44",null,0.5680566269,31.6,null,0.15,null],
        ["J1638-4417",null,0.1178025594457156,5.2,null,0.3,null],
        ["J1638-4608",null,0.27815476788856636,6,null,0.45,null],
        ["J1638-47",null,0.426668,142,null,0.21,null],
        ["J1638-4713",null,0.06574,null,null,null,null],
        ["J1638-4725",null,0.7639334782005852,52,null,0.32,null],
        ["J1638-5226",null,0.3405043739292722,11,null,0.6,null],
        ["J1639-1126",null,1.4306945334543675,null,null,null,null],
        ["J1639-4359",null,0.58755897769,24,null,0.92,null],
        ["J1639-46",null,0.5191365,24,null,0.09,null],
        ["J1639-4604","B1635-45",0.5291213666056371,5.7,15,1,null],
        ["J1640+2224",null,0.003163315818801591,0.3,8,0.46,null],
        ["J1640-4631",null,0.2064430478875038,null,null,null,null],
        ["J1640-4648",null,0.178352043293,15,null,0.26,null],
        ["J1640-4715","B1636-47",0.5174445978011597,26,null,1.56,null],
        ["J1640-4951",null,0.73909894649,14,null,0.15,null],
        ["J1641+3627A","B1639+36A",0.010377509451637994,0.7,3,0.14,null],
        ["J1641+3627B","B1639+36B",0.003528071804898864,0.46,null,0.022,null],
        ["J1641+3627C",null,0.003722081602998762,0.2,null,0.03,null],
        ["J1641+3627D",null,0.003118288899598604,0.2,null,0.024,null],
        ["J1641+3627E",null,0.0024869824973108726,0.15,null,0.01,null],
        ["J1641+3627F",null,0.003003500835979639,null,null,null,null],
        ["J1641+3627G",null,0.004323565395912205,null,null,null,null],
        ["J1641+3627H",null,0.011213921,null,null,null,null],
        ["J1641+3627I",null,0.00637517719321531,null,null,null,null],
        ["J1641+8049",null,0.0020211793871241536,0.16,null,null,null],
        ["J1641-2347",null,1.091008429855,47,null,1.9,null],
        ["J1641-49",null,0.79519,47,null,0.1,null],
        ["J1641-5317",null,0.17510626750218378,null,null,null,null],
        ["J1643+1338",null,1.09904716266,24.2,null,null,null],
        ["J1643-10",null,null,4,null,null,null],
        ["J1643-1224",null,0.004621641526749906,0.3,75,3.78,null],
        ["J1643-4505",null,0.2373903925589894,7.6,null,0.45,null],
        ["J1643-4522",null,1.3478994729,21,null,0.11,null],
        ["J1643-4550",null,0.7175281100751505,15,null,0.34,null],
        ["J1644-33",null,0.397,21,null,null,null],
        ["J1644-44",null,0.1739106,null,null,0.4,null],
        ["J1644-4559","B1641-45",0.45507820167172386,8,375,300,null],
        ["J1644-46",null,0.2509406,null,null,0.8,null],
        ["J1644-4657",null,0.12596223249,40.3,null,0.59,null],
        ["J1645+1012",null,0.410860719379,8.4,2.3,null,null],
        ["J1645-0317","B1642-03",0.3876916862625611,3.8,393,25.76,null],
        ["J1645-4836",null,1.66008,null,null,null,null],
        ["J1646-1910",null,4.817735829996004,132,null,0.08,null],
        ["J1646-2142",null,0.0058531078629779415,0.84,null,null,null],
        ["J1646-4308",null,0.8406799814,185,null,0.33,null],
        ["J1646-4346","B1643-43",0.2316033293,10.9,null,1.25,null],
        ["J1646-4406",null,null,null,null,null,null],
        ["J1646-4545",null,0.43178369786259957,null,null,null,null],
        ["J1646-5123",null,0.5300752074095164,16,null,0.17,null],
        ["J1646-6831","B1641-68",1.7856135973683689,77,23,4.9,null],
        ["J1647+6608",null,1.5997983753630112,23,null,null,null],
        ["J1647+6609",null,1.5997994268618423,null,null,null,null],
        ["J1647-3607",null,0.21231640921,4.1,null,0.2,null],
        ["J1647-4552",null,10.610656277430735,null,null,null,null],
        ["J1647-49",null,0.24752785,9.6,null,0.09,null],
        ["J1648-3256",null,0.7194578317948839,11,11,0.7,null],
        ["J1648-4458",null,0.62963153567,42,null,0.55,null],
        ["J1648-4611",null,0.16496589070479956,13,null,0.61,null],
        ["J1648-6044",null,0.5837651610751737,11,null,0.7,null],
        ["J1649+2533",null,1.0152573918,26.3,7.4,null,null],
        ["J1649-3012",null,0.0034244547841603733,null,null,null,null],
        ["J1649-3752",null,0.587242,null,null,null,null],
        ["J1649-3805",null,0.2620257171151691,6.7,null,1.75,null],
        ["J1649-3935",null,0.770909760511,20,null,0.05,null],
        ["J1649-4230",null,0.67641,null,null,null,null],
        ["J1649-4349",null,0.8707116053243179,71,null,0.75,null],
        ["J1649-4653",null,0.5570361972058916,18,null,0.37,null],
        ["J1649-4729",null,0.2976921997093398,18,null,0.29,null],
        ["J1649-5553",null,0.61357070436,47.9,null,1.4,null],
        ["J1650-1654",null,1.7495541359810591,46,13,1.1,null],
        ["J1650-4126",null,0.30891769685757997,5.7,null,0.29,null],
        ["J1650-4341",null,0.309398365719,22,null,0.26,null],
        ["J1650-4502",null,0.38086979928254927,7.4,null,0.61,null],
        ["J1650-4601",null,0.1271228933094091,null,null,null,null],
        ["J1650-4921",null,0.15639973854186173,2.6,null,0.29,null],
        ["J1650-5025",null,0.05967573,null,null,null,null],
        ["J1651+14",null,0.828,3,null,null,null],
        ["J1651-1709","B1648-17",0.9733961665304757,29,9,0.3,null],
        ["J1651-4246","B1648-42",0.8440813886617513,99,100,21,null],
        ["J1651-4519",null,0.51744320409,52,null,0.54,null],
        ["J1651-46",null,0.5693516,60,null,0.16,null],
        ["J1651-5222","B1647-52",0.6350584663368399,16,23,4.1,null],
        ["J1651-5255","B1647-528",0.8905365102003809,20.8,12,2.72,null],
        ["J1651-7642",null,1.7553118590751342,84,null,0.7,null],
        ["J1652+2651",null,0.9158034972,32.6,11.3,null,null],
        ["J1652-1400",null,0.30544707264979026,12,null,0.4,null],
        ["J1652-2404","B1649-23",1.7037391378577924,29.8,9.2,1.44,null],
        ["J1652-4237",null,0.496548,93,null,0.2,null],
        ["J1652-4406",null,7.707183007,null,null,null,null],
        ["J1652-4838",null,0.0037851238,null,null,0.917,null],
        ["J1652-5154",null,0.599681,null,null,null,null],
        ["J1653-0158",null,0.0019676820247057,null,null,null,null],
        ["J1653-2054",null,0.004129145284562,null,null,0.575,null],
        ["J1653-3838","B1650-38",0.3050399832825131,3.3,null,2,null],
        ["J1653-4030",null,1.0193715566424628,122,null,0.4,null],
        ["J1653-4105",null,0.49897806596,22.8,null,0.269,null],
        ["J1653-4249",null,0.6125582412239451,13,null,1.5,null],
        ["J1653-4315",null,0.41927974137,105,null,0.53,null],
        ["J1653-45",null,0.950977,15.9,null,null,null],
        ["J1653-4854",null,3.0595096022,75,null,0.18,null],
        ["J1654-23",null,0.54535972,null,null,null,null],
        ["J1654-26",null,1.62373,26,null,null,null],
        ["J1654-2713",null,0.7918224418732214,11.7,9,0.3,null],
        ["J1654-3710",null,0.93916547876343,17,null,0.22,null],
        ["J1654-4140",null,1.27394512577,19,null,0.71,null],
        ["J1654-4245",null,1.1015546927,31,null,0.14,null],
        ["J1655-3048",null,0.5429359076212851,85,null,2.2,null],
        ["J1655-3844",null,1.19343919921,23,null,0.25,null],
        ["J1655-401",null,0.276689,21,null,0.1,null],
        ["J1655-404",null,2.92728819,22.9,null,0.08,null],
        ["J1656+00",null,1.49785,31,null,null,null],
        ["J1656+6203",null,0.77615531125,16.7,null,null,null],
        ["J1656-3621",null,0.7301344131599777,17,null,0.29,null],
        ["J1657+3304",null,1.5702755247,31,null,null,null],
        ["J1657-0406A",null,0.00473,null,null,null,null],
        ["J1657-0406B",null,0.00735,null,null,null,null],
        ["J1657-4432",null,0.6096126631021941,13,null,0.38,null],
        ["J1657-46",null,0.89231027,90.6,null,0.16,null],
        ["J1658+3630",null,0.033027982326828936,1.3,null,null,null],
        ["J1658-2823",null,3.3597,null,null,null,null],
        ["J1658-4306",null,1.1664490044,97,null,0.8,null],
        ["J1658-47",null,0.3693649,27.4,null,0.18,null],
        ["J1658-4958",null,0.4168761908603367,12,null,1.6,null],
        ["J1658-5324",null,0.00243929590979642,null,null,0.43,null],
        ["J1659-1305","B1657-13",0.640958200231717,21,6.3,0.803,null],
        ["J1659-4316",null,0.47438143461,11,null,0.21,null],
        ["J1659-4439",null,0.3532930572037575,19,null,0.42,null],
        ["J1659-54",null,0.5445733267984534,null,null,null,null],
        ["J1700-0954",null,0.8173116024533176,33.5,null,0.35,null],
        ["J1700-3312",null,1.3583105103469157,35,21,1.6,null],
        ["J1700-3611",null,1.4940906152828997,22,null,0.8,null],
        ["J1700-39",null,3.74646,54,null,0.06,null],
        ["J1700-3919",null,0.56050353306523,13,null,0.23,null],
        ["J1700-4012",null,0.2837918537849287,15,null,0.13,null],
        ["J1700-4422",null,0.7555354095,55,null,0.3,null],
        ["J1700-4939",null,0.57836343922,12,null,0.17,null],
        ["J1701-3006A",null,0.005241566194852915,1.29,null,0.4,0.12],
        ["J1701-3006B",null,0.0035938521032511423,0.83,null,0.3,0.078],
        ["J1701-3006C",null,0.007612848706834977,0.65,null,0.3,0.72],
        ["J1701-3006D",null,0.0034177704554196,0.99,null,null,0.07],
        ["J1701-3006E",null,0.003233737354068274,0.47,null,null,0.039],
        ["J1701-3006F",null,0.002294727095702082,0.47,null,null,0.0052],
        ["J1701-3006G",null,0.004608102638467623,0.81,null,0.08,null],
        ["J1701-3006H",null,0.0037047604491661514,0.74,null,null,null],
        ["J1701-3006I",null,0.0032956166567914024,0.39,null,null,null],
        ["J1701-3130",null,0.2913414710251,6.8,null,null,null],
        ["J1701-3726","B1658-37",2.454618042634058,40.9,null,4.1,null],
        ["J1701-4533","B1657-45",0.3229090666976009,20,null,3.1,null],
        ["J1701-4958",null,0.80430423739,128.7,null,0.26,null],
        ["J1702-3932",null,0.390327976785,14,null,0.3,null],
        ["J1702-4128",null,0.182135802939,12,null,1.17,null],
        ["J1702-4145",null,0.345805,null,null,null,null],
        ["J1702-4217",null,0.22756495845775607,41,null,0.5,null],
        ["J1702-4306",null,0.21550847333672143,8.2,null,0.46,null],
        ["J1702-4310",null,0.24052386477,11.5,null,0.92,null],
        ["J1702-4428",null,2.1235057036,74,null,0.38,null],
        ["J1703-18",null,1.27024,null,null,null,null],
        ["J1703-1846","B1700-18",0.8043425117987315,11,11,0.7,null],
        ["J1703-3241","B1700-32",1.2117850946469777,39,32,8.7,null],
        ["J1703-38",null,6.443,9,null,null,null],
        ["J1703-4442",null,1.74729348943,12,null,0.21,null],
        ["J1703-4851",null,1.3964049836835726,11,22,1.4,null],
        ["J1704-3549",null,2.270547,null,null,null,null],
        ["J1704-3756",null,0.305234449799,11.7,null,0.134,null],
        ["J1704-5236",null,0.230708506176636,7.273,null,0.605,null],
        ["J1704-6016","B1659-60",0.3063230254,90,23,null,null],
        ["J1705-04",null,0.23748,null,null,null,null],
        ["J1705-1903",null,0.00248022,null,null,0.575,null],
        ["J1705-1906","B1702-19",0.29899124406027927,8.2,29,5.66,null],
        ["J1705-3423",null,0.2554267757078127,12,31,5.3,null],
        ["J1705-3936",null,0.8544816637,22,null,0.33,null],
        ["J1705-3950",null,0.3189794012856402,8.1,null,1.6,null],
        ["J1705-4108",null,0.8610674067,40.4,null,1.3,null],
        ["J1705-4331",null,0.22256113349563522,11,null,0.4,null],
        ["J1705-6135",null,0.808546089,165.7,null,0.4,null],
        ["J1706+59",null,1.47669,20,8,null,null],
        ["J1706-3839",null,0.58628740134,26,null,0.2,null],
        ["J1706-4020",null,0.180632,null,null,null,null],
        ["J1706-4310",null,0.6169790441,16,null,0.28,null],
        ["J1706-4434",null,0.42992242325,11.8,null,0.19,null],
        ["J1706-6118",null,0.3619213249276,2.5,null,null,null],
        ["J1707+3556",null,0.15976470098274653,5.2,null,null,null],
        ["J1707-4053","B1703-40",0.5810176957158364,30.7,null,10,null],
        ["J1707-4341",null,0.8905982927634628,9.6,null,0.46,null],
        ["J1707-4417",null,5.763777003,242,null,null,null],
        ["J1707-4729",null,0.266474706971287,6.2,null,2.4,null],
        ["J1708+02",null,0.410772,null,null,null,null],
        ["J1708-3426",null,0.6921156959988298,21,36,2,null],
        ["J1708-3506",null,0.0045051589484590565,0.55,null,1.45,null],
        ["J1708-3641",null,0.587566793839,15,null,0.12,null],
        ["J1708-38",null,0.6698359,21,null,0.07,null],
        ["J1708-3827",null,1.225781996,40,null,0.42,null],
        ["J1708-4008",null,11.006262398210646,null,null,null,null],
        ["J1708-4522",null,1.2978368378157945,17,null,0.22,null],
        ["J1708-4843",null,0.016657266,null,null,null,null],
        ["J1708-52",null,0.44962,null,null,null,null],
        ["J1708-7539","B1701-75",1.1910239966,25,2.5,0.747,null],
        ["J1709+2313",null,0.0046311962778409,0.8,2.52,0.19,null],
        ["J1709-0333",null,0.0035240120216907794,null,null,null,null],
        ["J1709-1640","B1706-16",0.6530607213871698,8.9,47,15,null],
        ["J1709-3626",null,0.4478586307863153,18,null,0.58,null],
        ["J1709-3841",null,0.5869861631851989,18,null,0.31,null],
        ["J1709-43",null,null,3,null,null,null],
        ["J1709-4342",null,1.735898235,50,null,0.14,null],
        ["J1709-4401",null,0.8652381563881876,9.3,null,0.8,null],
        ["J1709-4429","B1706-44",0.10253322603073806,6,25,12.1,null],
        ["J1710+4923",null,0.0032202283985644457,0.2,null,null,null],
        ["J1710-2616",null,0.954158007,87.5,null,0.9,null],
        ["J1710-37",null,0.79265922183,61.4,null,0.1,null],
        ["J1710-3946",null,0.977337,18,null,0.06,null],
        ["J1710-4148",null,0.286561228631,13,null,0.31,null],
        ["J1711-1509","B1709-15",0.8688051661952018,11,5.9,0.7,null],
        ["J1711-3826",null,0.46536464559,24,null,0.16,null],
        ["J1711-4322",null,0.10261828834718216,7.8,null,0.26,null],
        ["J1711-5350","B1707-53",0.8992327348135307,12,9,0.836,null],
        ["J1712-2715",null,0.255359660118,33,null,null,null],
        ["J1712-391",null,0.778149,null,null,null,null],
        ["J1712-392",null,0.0925277,null,null,null,null],
        ["J1713+0747",null,0.004570136598154467,0.3,6.8,8.3,6],
        ["J1713+7810",null,0.43252593524,16,null,null,null],
        ["J1713-3844",null,1.6001140423,17,null,0.26,null],
        ["J1713-3949",null,0.3924514,12,null,0.35,null],
        ["J1714-1054",null,2.0888363595934756,7.5,null,0.5,null],
        ["J1714-3810",null,3.824936,null,null,null,null],
        ["J1714-3830",null,0.08414,null,null,null,null],
        ["J1715+4603",null,0.548097027876251,16,null,null,null],
        ["J1715-3247",null,1.26021405926,60,null,0.08,null],
        ["J1715-3700",null,0.7796281139920065,110,null,0.37,null],
        ["J1715-3859",null,0.9281075077537047,86,null,0.54,null],
        ["J1715-3903",null,0.27849394743652517,8.2,null,0.66,null],
        ["J1715-4034",null,2.072154597577679,77.1,null,1.9,null],
        ["J1715-4254",null,0.5737453589221617,26,null,0.07,null],
        ["J1716+34",null,0.00211,null,null,null,null],
        ["J1716-3720",null,0.6303137128497507,14,null,0.41,null],
        ["J1716-3811",null,0.82912,null,null,null,null],
        ["J1716-4005",null,0.31181276456,13.4,null,1.79,null],
        ["J1716-4111",null,1.03606727254,10,null,0.22,null],
        ["J1716-4711",null,0.5558245279813777,4.3,null,0.3,null],
        ["J1717+03",null,3.901,8.4,null,null,null],
        ["J1717+4308A",null,0.0031597205227829705,null,null,null,null],
        ["J1717-3425","B1714-34",0.6562992314590905,15,null,3.9,null],
        ["J1717-3737",null,0.68241862653,23,null,0.69,null],
        ["J1717-3847",null,1.1494989184,287,null,0.3,null],
        ["J1717-3953",null,1.0855206154107775,299,null,1.5,null],
        ["J1717-4043",null,0.39785744656,41,null,0.54,null],
        ["J1717-40435",null,0.34992850807,38,null,0.41,null],
        ["J1717-4054","B1713-40",0.8877194563423443,9.6,15,1.1,null],
        ["J1717-41",null,0.546233,108,null,0.14,null],
        ["J1717-5800",null,0.3217934800925987,12,null,0.5,null],
        ["J1718-3714",null,1.2893787775240544,96,null,0.23,null],
        ["J1718-3718",null,3.37857425327525,152,null,0.4,null],
        ["J1718-3825",null,0.07467469866132408,1.8,null,1.7,null],
        ["J1718-41",null,0.5484192,28.4,null,0.07,null],
        ["J1718-4539",null,0.5904727877161426,8.1,null,0.08,null],
        ["J1719-1438",null,0.005790151770023846,0.3,null,0.43,null],
        ["J1719-2330",null,0.453992694395,8.9,null,0.16,null],
        ["J1719-3458",null,0.493774733755,21,null,0.2,null],
        ["J1719-36",null,0.7571511,23,null,0.1,null],
        ["J1719-4006","B1715-40",0.189094492501,6.1,null,1.4,null],
        ["J1719-4302",null,0.2354754715465329,4.6,null,0.37,null],
        ["J1720+00",null,3.357,7.2,null,null,null],
        ["J1720+2150",null,1.61566378034,48.1,2.4,null,null],
        ["J1720-0212","B1718-02",0.4777154228575718,50,22,1,null],
        ["J1720-0533",null,0.0032676517102711187,null,null,null,null],
        ["J1720-1633","B1717-16",1.5656060490100163,12,13,1.1,null],
        ["J1720-2446",null,0.87426457245,31,null,null,null],
        ["J1720-2933","B1717-29",0.6204489895848166,18,32,1.69,null],
        ["J1720-36",null,0.09213212,8.41,null,0.08,null],
        ["J1720-3659",null,0.35112463372247477,6.9,null,0.74,null],
        ["J1721-0855",null,2.1813265434955156,null,null,null,null],
        ["J1721-1936","B1718-19",1.0040374566964214,20.6,0.5,0.3,null],
        ["J1721-1939",null,0.40403975128,null,null,null,null],
        ["J1721-2457",null,0.0034966337827001645,0.58,null,0.58,null],
        ["J1721-3532","B1718-35",0.2804238585494842,29.8,null,16.8,null],
        ["J1722+3519",null,0.8216175744405284,10.8,null,null,null],
        ["J1722-3207","B1718-32",0.4771579477894289,9.8,61,5.4,null],
        ["J1722-3632","B1718-36",0.399186531535658,24,null,2.9,null],
        ["J1722-3712","B1719-37",0.236179743432018,3.9,25,3.8,null],
        ["J1722-4400",null,0.21855409582721647,2.6,null,0.22,null],
        ["J1723-2837",null,0.0018557327957289703,0.2,null,1.1,0.2],
        ["J1723-2852",null,0.6250339127,50,null,0.13,null],
        ["J1723-3659",null,0.20272489920793296,7.9,null,2.1,null],
        ["J1723-38",null,0.76579581473,13.7,null,0.08,null],
        ["J1723-380",null,0.15092447,10.6,null,0.16,null],
        ["J1723-40",null,1.982265,20,null,0.11,null],
        ["J1724-3149",null,0.9482369741014413,37,null,0.36,null],
        ["J1724-35",null,1.42199,5.9,null,null,null],
        ["J1724-3505",null,1.2217076920906704,24,null,0.24,null],
        ["J1724-4500",null,1.3091087872611495,28,null,0.05,null],
        ["J1725-0732",null,0.239919487227,8.7,null,0.11,null],
        ["J1725-2852",null,1.2577876250977178,37,null,0.25,null],
        ["J1725-3546",null,1.032471199291008,35,null,0.61,null],
        ["J1725-38",null,0.3926412,6.1,null,0.06,null],
        ["J1725-3848",null,2.0623862583,32,null,0.14,null],
        ["J1725-3853",null,0.004791822704,0.865,null,null,null],
        ["J1725-4043",null,1.46507137487,50,null,0.34,null],
        ["J1726-00",null,1.3086,null,null,null,null],
        ["J1726-31",null,0.12347018,null,null,0.4,null],
        ["J1726-3530",null,1.1101324440295186,37,null,0.39,null],
        ["J1726-3635",null,0.28743156718375357,7,null,0.29,null],
        ["J1726-4006",null,0.8827782656480259,20,null,0.21,null],
        ["J1726-52",null,0.6318,null,null,null,null],
        ["J1727-1609",null,0.00245,null,null,null,null],
        ["J1727-2739",null,1.2930999462602275,90,null,1.7,null],
        ["J1727-29",null,null,7.2,null,null,null],
        ["J1727-2946",null,0.0270831832440066,1.8,null,0.265,null],
        ["J1727-2951",null,0.0284049534402,11.4,null,0.514,null],
        ["J1728-0007","B1726-00",0.3860037238349235,20,11,0.655,null],
        ["J1728-36",null,0.35431017,12.5,null,0.09,null],
        ["J1728-3733",null,0.615538243086013,8.1,null,0.19,null],
        ["J1728-4028",null,0.8663425091382198,102,null,1.2,null],
        ["J1729-2117",null,0.0662928992668,1.3,null,0.2,null],
        ["J1730+13",null,1.15,null,null,null,null],
        ["J1730-2304",null,0.008122798048058056,0.965,43,4,null],
        ["J1730-2900",null,1.538426726349872,23,null,0.13,null],
        ["J1730-3350","B1727-33",0.13950562163309552,8.2,9.2,4.3,null],
        ["J1730-3353",null,3.270241803205151,54,null,0.38,null],
        ["J1730-34",null,0.09982956,25.9,null,0.03,null],
        ["J1731-1847",null,0.002344559546885677,0.13,null,0.38,null],
        ["J1731-3123",null,0.7530479890014684,22,null,0.29,null],
        ["J1731-33",null,0.6069003,48.4,null,null,null],
        ["J1731-3322",null,0.54467054719,33.5,null,0.1,null],
        ["J1731-4744","B1727-47",0.8299456121937843,18,190,27,null],
        ["J1732-1930",null,0.4837699980472797,16,11,0.3,null],
        ["J1732-3131",null,0.19654315496481217,null,null,null,null],
        ["J1732-3426",null,0.33288667881493283,14,null,0.24,null],
        ["J1732-35",null,0.126689998553,6.6,null,0.13,null],
        ["J1732-3729",null,2.18400134708,40,null,0.31,null],
        ["J1732-4128","B1729-41",0.6279806844,13.4,9,1.1,null],
        ["J1732-4156",null,0.3234340559691621,21,null,0.22,null],
        ["J1732-5049",null,0.0053125502904328,0.292,null,2.11,null],
        ["J1733-01",null,0.302,10,null,null,null],
        ["J1733-2228","B1730-22",0.8716828329861209,61.3,25,4.21,null],
        ["J1733-2533",null,0.6597941416778241,35,null,0.1,null],
        ["J1733-2837",null,0.7681845567424089,12,null,0.07,null],
        ["J1733-3030",null,0.36205196285999064,16,null,0.2,null],
        ["J1733-3322",null,1.245914634016575,34.3,null,0.8,null],
        ["J1733-3716","B1730-37",0.33760015449182973,4.3,null,3.6,null],
        ["J1733-4005",null,0.5617805367938467,7.1,null,0.49,null],
        ["J1733-5515",null,1.011233535,45.5,null,0.3,null],
        ["J1734-0212","B1732-02",0.839394324968405,27,5.7,0.279,null],
        ["J1734-2415",null,0.6125237399914504,17,null,0.29,null],
        ["J1734-2859",null,0.301455877926,8.72,null,0.13,null],
        ["J1734-3058",null,0.54128568073,14,null,0.11,null],
        ["J1734-3333",null,1.1693406847365546,230.6,null,0.71,null],
        ["J1735+6320",null,0.510718135408,9,0.6,null,null],
        ["J1735-0243",null,0.7828869765,13,null,null,null],
        ["J1735-0724","B1732-07",0.4193349661853239,4.9,18,2.76,null],
        ["J1735-25",null,0.11868265,4.2,null,0.11,null],
        ["J1735-28",null,0.4285601,60,null,0.05,null],
        ["J1735-3258",null,0.35097173145091837,85,null,0.35,null],
        ["J1735-33",null,1.273866,18,null,0.09,null],
        ["J1736+05",null,0.999245,13,null,null,null],
        ["J1736-0245_P",null,0.139298,null,null,null,null],
        ["J1736-2457",null,2.6422234390449013,62,null,0.84,null],
        ["J1736-2819",null,1.592419480193175,21,null,0.16,null],
        ["J1736-2843",null,6.445036086110556,145,null,0.43,null],
        ["J1736-3422",null,0.34693193860745286,null,null,null,null],
        ["J1736-3511",null,0.5028027829,15,null,0.18,null],
        ["J1737-0314A",null,0.0019799762460908765,null,null,null,null],
        ["J1737-0314B",null,0.00852,null,null,null,null],
        ["J1737-0314C",null,0.00846,null,null,null,null],
        ["J1737-0314D",null,0.00289,null,null,null,null],
        ["J1737-0314E",null,0.00228,null,null,null,null],
        ["J1737-0811",null,0.0041750173128551,0.52,null,1.07,null],
        ["J1737-3102",null,0.7686722733910539,14,null,0.6,null],
        ["J1737-3137",null,0.45043236999367015,16.3,null,0.88,null],
        ["J1737-32",null,0.63405961,94.1,null,0.29,null],
        ["J1737-3320",null,0.8162730801780425,42,null,0.35,null],
        ["J1737-3555","B1734-35",0.39759057907288814,6.6,null,1,null],
        ["J1738+0333",null,0.005850095859775686,0.5,null,0.34,0.46],
        ["J1738+04",null,1.39179,27,null,null,null],
        ["J1738-0319_P",null,1.369302,null,null,null,null],
        ["J1738-2330",null,1.9788474316296447,35,null,1.05,null],
        ["J1738-2647",null,0.34959099098249385,3.8,null,0.44,null],
        ["J1738-2736",null,0.627715518484,12,null,0.17,null],
        ["J1738-2955",null,0.44342528829597977,8.2,null,0.24,null],
        ["J1738-3107",null,0.549497698285362,34,null,0.26,null],
        ["J1738-3211","B1735-32",0.7684996307115532,11,2.9,2.4,null],
        ["J1738-33",null,0.3577344,27,null,0.07,null],
        ["J1738-3316",null,0.7303725110151269,91,null,0.55,null],
        ["J1739+0612",null,0.234169123379985,7.4,null,0.8,null],
        ["J1739-1313",null,1.2156976878741268,7.1,null,0.9,null],
        ["J1739-2521",null,1.8184611929,43,null,null,null],
        ["J1739-26",null,0.4901418,8.4,null,0.08,null],
        ["J1739-2903","B1736-29",0.32288920922305214,6,null,4.5,null],
        ["J1739-3023",null,0.11437172844730296,3.6,null,1.01,null],
        ["J1739-3049",null,0.23931717840584732,18.8,null,0.5,null],
        ["J1739-31",null,0.27710525,14.1,null,0.2,null],
        ["J1739-3131","B1736-31",0.5294409884251815,26,null,7.04,null],
        ["J1739-3159",null,0.8775612371422854,55.8,null,1.4,null],
        ["J1739-3951",null,0.34177247679941797,10,null,0.12,null],
        ["J1740+1000",null,0.1541010803937552,6.9,3.1,2.7,1.3],
        ["J1740+1311","B1737+13",0.803051666099923,12.9,24,2.1,null],
        ["J1740+2715",null,1.0582099056192804,20.2,null,null,null],
        ["J1740-2540",null,1.6926563404030377,30,null,0.16,null],
        ["J1740-3015","B1737-30",0.6068866242543225,3,24.6,8.9,null],
        ["J1740-3052",null,0.570313411724,12,null,0.7,null],
        ["J1740-3327",null,0.5150006564023524,12,null,0.3,null],
        ["J1740-5340A",null,0.0036503288972,null,null,null,null],
        ["J1740-5340B",null,0.005786968489089198,null,null,null,null],
        ["J1741+1351",null,0.00374715450025994,0.2,3.2,0.29,null],
        ["J1741+2758",null,1.3607376546906016,37,3,null,null],
        ["J1741+3855",null,0.82886088996,21.2,null,null,null],
        ["J1741-0840","B1738-08",2.0430845901925956,64,29,1.4,null],
        ["J1741-2019",null,3.90450636119,120,null,null,null],
        ["J1741-2054",null,0.4137001208367996,29,null,0.16,0.09],
        ["J1741-21",null,2.565,82,null,null,null],
        ["J1741-2152",null,2.565552374919097,null,null,null,null],
        ["J1741-2719",null,0.34679692914237337,14,null,0.2,null],
        ["J1741-2733",null,0.8929586697783418,40.9,null,1.8,null],
        ["J1741-2945",null,0.22355782854141476,10.7,null,0.6,null],
        ["J1741-3016",null,1.8937486937687293,35.2,2.5,2.6,null],
        ["J1741-34",null,0.875137,19.1,null,0.2,null],
        ["J1741-3927","B1737-39",0.5122123551296487,12,35,5.5,null],
        ["J1742+20",null,0.2526,null,null,null,null],
        ["J1742-0203",null,0.13160967944076488,5,null,null,null],
        ["J1742-0237_P",null,0.00366367,null,null,null,null],
        ["J1742-0559",null,0.9181790697937042,null,null,null,null],
        ["J1742-3321",null,0.14330671312909762,null,null,null,null],
        ["J1742-3957",null,1.0163491951009795,65,null,0.14,null],
        ["J1742-4616",null,0.41240107806257004,23,null,1.5,null],
        ["J1743+05",null,1.47363,55,null,null,null],
        ["J1743-0339","B1740-03",0.4446463677529486,13.2,3.1,0.5,null],
        ["J1743-1351","B1740-13",0.40533735948612276,16,6.1,0.5,null],
        ["J1743-2442",null,1.2425083090879718,75,null,0.14,null],
        ["J1743-3150","B1740-31",2.414652314520231,45,6.6,2.1,null],
        ["J1743-3153",null,0.19311279046444202,12,null,0.6,null],
        ["J1743-35",null,0.56998,16.9,null,0.05,null],
        ["J1743-4212",null,0.30616750582447877,6,null,1.9,null],
        ["J1744-1134",null,0.004074545942316071,0.1,18,2.6,null],
        ["J1744-1610",null,1.757205868816,34,null,null,null],
        ["J1744-2335",null,1.68350668862,26,16,0.2,null],
        ["J1744-2946",null,0.008392190857823927,null,null,null,null],
        ["J1744-3130",null,1.0660763311910035,15,null,0.7,null],
        ["J1744-3922",null,0.172444360995,2.7,null,0.11,null],
        ["J1744-5337",null,0.3556659212003563,11,null,0.4,null],
        ["J1744-7619",null,0.004687524094895362,null,null,null,null],
        ["J1745+1017",null,0.0026521296710896713,0.3,null,0.51,null],
        ["J1745+1252",null,1.0598487584,36,null,null,null],
        ["J1745+4254",null,0.30505455384700964,12,null,null,null],
        ["J1745-0059",null,0.6795163543090238,null,null,null,null],
        ["J1745-0129",null,1.045406855598,7,null,null,null],
        ["J1745-0952",null,0.019376303441129426,1.8,1.8,0.38,null],
        ["J1745-2229",null,1.1605925381655646,14,null,0.13,null],
        ["J1745-23",null,0.00541669986,0.66,null,null,null],
        ["J1745-2758",null,0.4875279980329526,29.9,null,0.15,null],
        ["J1745-2900",null,3.7637330800937145,null,null,null,1.2],
        ["J1745-2910",null,0.982,54,null,null,0.2],
        ["J1745-2912",null,0.1873794,null,null,null,null],
        ["J1745-3040","B1742-30",0.3674375271349171,4.7,66,21,null],
        ["J1745-3812",null,0.6983528638,10,null,0.2,null],
        ["J1746+2245",null,3.46503778264,17,1.26,null,null],
        ["J1746+2540",null,1.0581481703,24,1.2,null,null],
        ["J1746-0156",null,1.8290466048290133,null,null,null,null],
        ["J1746-2829",null,1.888928609337,null,null,0.55,null],
        ["J1746-2849",null,1.478480373,31,null,0.4,0.2],
        ["J1746-2850",null,1.077101491,45,null,0.8,0.6],
        ["J1746-2856",null,0.945224316,288,null,null,null],
        ["J1746-3239",null,0.19954135987126467,null,null,null,null],
        ["J1747-1030",null,1.5787928888,null,null,null,null],
        ["J1747-2647",null,0.500254454491,66,null,1.54,null],
        ["J1747-2802",null,2.7800791979209385,27.3,null,0.5,null],
        ["J1747-2809",null,0.052152855,null,null,null,null],
        ["J1747-2958",null,0.09881397648246944,7,null,0.25,null],
        ["J1747-4036",null,0.0016456096148060395,null,null,1.506,0.5],
        ["J1748-0224_P",null,0.00176509,null,null,null,null],
        ["J1748-1300","B1745-12",0.39413433542657617,11,23,2,null],
        ["J1748-2021A","B1745-20A",0.2886027917196835,72,10,0.37,0.37],
        ["J1748-2021B",null,0.016760127219256793,null,null,null,0.047],
        ["J1748-2021C",null,0.006226932720486728,null,null,null,0.044],
        ["J1748-2021D",null,0.013495820403908898,null,null,null,0.075],
        ["J1748-2021E",null,0.016264003411124592,null,null,null,0.023],
        ["J1748-2021F",null,0.0037936291149481298,null,null,null,0.017],
        ["J1748-2444",null,0.4428384991298492,5.2,null,0.34,null],
        ["J1748-2446A","B1744-24A",0.01156314838240718,0.8,null,0.61,1.7],
        ["J1748-2446C",null,0.0084360953044,2,null,1.1,0.67],
        ["J1748-2446D",null,0.00471398,null,null,0.071,0.045],
        ["J1748-2446E",null,0.0021978,null,null,0.17,0.11],
        ["J1748-2446F",null,0.00554014,null,null,0.055,0.035],
        ["J1748-2446G",null,0.02167187,null,null,0.024,0.022],
        ["J1748-2446H",null,0.00492589,null,null,0.039,0.024],
        ["J1748-2446I",null,0.00957019,null,null,0.095,0.055],
        ["J1748-2446J",null,0.08033793,null,null,0.058,0.027],
        ["J1748-2446K",null,0.00296965,null,null,0.066,0.039],
        ["J1748-2446L",null,0.0022447,null,null,0.096,0.043],
        ["J1748-2446M",null,0.00356957,null,null,0.14,0.091],
        ["J1748-2446N",null,0.0086669,null,null,0.15,0.1],
        ["J1748-2446O",null,0.00167663,null,null,0.31,0.16],
        ["J1748-2446P",null,0.00172862,null,null,null,0.077],
        ["J1748-2446Q",null,0.002812,null,null,0.056,0.036],
        ["J1748-2446R",null,0.00502854,null,null,0.035,0.017],
        ["J1748-2446S",null,0.00611664,null,null,0.02,0.014],
        ["J1748-2446T",null,0.00708491,null,null,0.026,0.015],
        ["J1748-2446U",null,0.00328914,null,null,0.03,0.012],
        ["J1748-2446V",null,0.00207251,null,null,0.1,0.077],
        ["J1748-2446W",null,0.00420518,null,null,0.054,0.031],
        ["J1748-2446X",null,0.00299926,null,null,0.043,0.024],
        ["J1748-2446Y",null,0.00204816,null,null,0.037,0.029],
        ["J1748-2446Z",null,0.00246259,null,null,0.03,0.023],
        ["J1748-2446aa",null,0.00578804,null,null,0.029,0.02],
        ["J1748-2446ab",null,0.00511971,0.8,null,0.045,0.023],
        ["J1748-2446ac",null,0.00508691,null,null,0.031,0.017],
        ["J1748-2446ad",null,0.00139595482,null,null,null,0.08],
        ["J1748-2446ae",null,0.00365859,null,null,0.056,0.05],
        ["J1748-2446af",null,0.00330434,null,null,0.033,0.022],
        ["J1748-2446ag",null,0.00444803,null,null,0.016,0.0092],
        ["J1748-2446ah",null,0.00496515,null,null,0.014,0.0071],
        ["J1748-2446ai",null,0.02122838,null,null,0.033,0.028],
        ["J1748-2446aj",null,0.0029589095505840575,null,null,0.034,null],
        ["J1748-2446ak",null,0.0018901066845054798,null,null,0.03,null],
        ["J1748-2446al",null,0.00595,null,null,0.008,null],
        ["J1748-2446am",null,0.002933819877244274,null,null,null,0.015],
        ["J1748-2446an",null,0.004802337767150097,null,null,0.031,null],
        ["J1748-2446ao",null,0.002274378773929981,null,null,null,null],
        ["J1748-2446ap",null,0.003744692938598998,null,null,null,null],
        ["J1748-2446aq",null,0.012521942664278491,null,null,null,null],
        ["J1748-2446ar",null,0.0019528107508982422,null,null,null,null],
        ["J1748-2446as",null,0.002326455083013782,null,null,null,null],
        ["J1748-2446at",null,0.0021881853068323985,null,null,null,null],
        ["J1748-2446au",null,0.004548215152922519,null,null,null,null],
        ["J1748-2446av",null,0.0018494486647931416,null,null,null,null],
        ["J1748-2446aw",null,0.013049077646116678,null,null,null,null],
        ["J1748-2446ax",null,0.0019434983799840582,null,null,null,null],
        ["J1748-2815",null,0.10015693040063713,null,null,null,null],
        ["J1748-30",null,0.3827347,25.5,null,0.16,null],
        ["J1748-3009",null,0.009683961337178712,null,null,1.4,null],
        ["J1749+16",null,2.31165,61,null,null,null],
        ["J1749+5952",null,0.436040950719,13.3,null,null,null],
        ["J1749-2146",null,2.71455556146,121.3,null,null,null],
        ["J1749-2347",null,0.8744858817015982,9.1,null,0.13,null],
        ["J1749-2629",null,1.3353877905746243,46.4,null,0.7,null],
        ["J1749-3002","B1746-30",0.6098736486726055,41.7,12.7,4.1,null],
        ["J1749-4931",null,0.445822307,5.2,null,0.1,null],
        ["J1749-5417",null,0.30757675186,13,null,0.321,null],
        ["J1749-5605","B1745-56",1.3323097198,18,3,0.635,null],
        ["J1750+07",null,1.90881,null,null,null,null],
        ["J1750-0043_P",null,0.57181,null,null,null,null],
        ["J1750-0112_P",null,0.00889597,null,null,null,null],
        ["J1750-2043",null,5.63904707921885,358,null,0.24,null],
        ["J1750-2438",null,0.7127940367738814,9.6,null,0.5,null],
        ["J1750-2444",null,0.8993767214021657,32,null,0.27,null],
        ["J1750-2536",null,0.034749053,null,null,0.107,null],
        ["J1750-28",null,1.3005131462,16.8,null,0.09,null],
        ["J1750-3116A",null,0.00533290111890514,null,null,null,null],
        ["J1750-3157","B1747-31",0.9103631532020736,8.9,null,1.4,null],
        ["J1750-3503",null,0.6840136478767852,65,29,0.79,null],
        ["J1750-3703A",null,0.1116008373133049,null,null,null,0.059],
        ["J1750-3703B",null,0.006074542086503449,null,null,null,0.037],
        ["J1750-3703C",null,0.026568678374967045,null,null,null,0.015],
        ["J1750-3703D",null,0.005139936774901917,null,null,null,0.01],
        ["J1751-0542",null,2.0013837873156834,null,null,null,null],
        ["J1751-2516",null,0.3948357835730665,27.3,null,0.22,null],
        ["J1751-2737",null,0.00223,0.55,null,null,0.3],
        ["J1751-2857",null,0.003914873259433347,0.25,null,0.461,null],
        ["J1751-3323",null,0.5482308811146329,7.5,null,1.67,null],
        ["J1751-4657","B1747-46",0.7423536034382896,13,70,6.6,null],
        ["J1752+2359",null,0.409050865044,5.6,3.5,null,null],
        ["J1752-2410",null,0.191036693534136,7.1,null,0.47,null],
        ["J1752-2806","B1749-28",0.5625667194580058,6.6,1100,48,null],
        ["J1752-2821",null,0.6402294995223345,11.5,null,0.32,null],
        ["J1753-0006_P",null,0.263349,null,null,null,null],
        ["J1753-0217_P",null,1.03957,null,null,null,null],
        ["J1753-12",null,0.405454,null,null,null,null],
        ["J1753-1914",null,0.0629548889724542,10,null,0.13,null],
        ["J1753-2240",null,0.0951378086771,3,null,0.15,null],
        ["J1753-2501","B1750-24",0.5283364093572904,57,null,2.3,null],
        ["J1753-28",null,0.08585861,3.9,null,null,null],
        ["J1753-2819",null,0.01862363183261758,1.51,null,0.14,null],
        ["J1753-38",null,0.666804,9,null,null,null],
        ["J1754+0000_P",null,0.0611325,null,null,null,null],
        ["J1754+0032",null,0.0044108,null,null,0.61,null],
        ["J1754+48",null,0.652,null,null,null,null],
        ["J1754+5201","B1753+52",2.3913967948556385,11.4,4.9,1.6,null],
        ["J1754-2422",null,2.0902480768,null,null,null,null],
        ["J1754-3014",null,1.3204904144,36,null,null,null],
        ["J1754-3443",null,0.36169095775379345,12,null,0.49,null],
        ["J1754-3510",null,0.3927043249702113,2.3,null,0.47,null],
        ["J1755-0903",null,0.190709642575,3.9,null,null,null],
        ["J1755-1650",null,0.7337444387100474,14,null,0.13,null],
        ["J1755-2025",null,0.322231178915,6.9,null,0.18,null],
        ["J1755-22",null,0.5706873,13,null,0.07,null],
        ["J1755-2521",null,1.1759678771862048,13.4,null,0.7,null],
        ["J1755-25211",null,1.0045125533911547,20,null,0.17,null],
        ["J1755-2534",null,0.23354062544549067,15,null,0.17,null],
        ["J1755-2550",null,0.3151960620987,16,null,0.2,null],
        ["J1755-26",null,0.43087215605,16.3,null,0.14,null],
        ["J1755-2725",null,0.2619546783248513,9,null,0.5,null],
        ["J1755-33",null,0.959466,null,null,0.2,null],
        ["J1755-3716",null,0.012786069289987706,3.9,null,0.524,null],
        ["J1756+1822",null,0.7440009397588363,17.1,0.7,0.014,null],
        ["J1756-2225",null,0.40498030096014764,11,null,0.25,null],
        ["J1756-2251",null,0.02846158902599829,0.78,null,1.087,null],
        ["J1756-2435","B1753-24",0.6704799625529156,25,8.4,2,null],
        ["J1756-25",null,0.4878897,7.5,null,0.06,null],
        ["J1756-2619",null,0.72451374873,18,null,0.1,null],
        ["J1757-1500",null,0.179354019096,3.3,null,0.09,null],
        ["J1757-16",null,0.451273,null,null,null,null],
        ["J1757-1854",null,0.021497232071176844,0.705,null,0.142,null],
        ["J1757-2223",null,0.18531010157882535,1.3,null,1,null],
        ["J1757-2421","B1754-24",0.2341093610760437,10,20,7.2,null],
        ["J1757-26",null,0.354459,125,null,0.32,null],
        ["J1757-2745",null,0.01768721504510766,0.49,null,0.07,null],
        ["J1757-5322",null,0.008869961227277,0.43,null,1.17,null],
        ["J1757-6032",null,0.002912498069977184,null,null,null,null],
        ["J1758+3030",null,0.9472559177815724,34,8.9,null,null],
        ["J1758-1931",null,0.6925515781544404,21,null,0.38,null],
        ["J1758-2206",null,0.4302782504966227,16.6,null,0.41,null],
        ["J1758-24",null,0.6331055,49,null,0.18,null],
        ["J1758-25",null,0.6055017,14.6,null,0.09,null],
        ["J1758-2540",null,2.107263371221978,120,null,0.65,null],
        ["J1758-2630",null,1.2028934632244577,15.6,null,0.41,null],
        ["J1758-2846",null,0.7667063862130211,4.4,null,0.2,null],
        ["J1759+5036",null,0.17601634721733,0.54,null,0.12,null],
        ["J1759-1029",null,2.5122628118,185,null,null,null],
        ["J1759-1248_P",null,0.0031512160118226545,null,null,133,null],
        ["J1759-1736",null,0.7984515669515078,18,null,0.12,null],
        ["J1759-1903",null,0.7315054725005198,34,null,0.16,null],
        ["J1759-1940",null,0.2547203522687561,19.6,null,0.9,null],
        ["J1759-1956",null,2.843388809724605,37.9,null,0.41,null],
        ["J1759-2205","B1756-22",0.4609832237054533,3.9,20,1.3,null],
        ["J1759-2302",null,0.810717729063275,52.2,null,1.3,null],
        ["J1759-2307",null,0.5588886775386461,22.4,null,0.7,null],
        ["J1759-24",null,1.457739,72.3,null,0.5,null],
        ["J1759-2549",null,0.9565485487283417,15.6,null,0.6,null],
        ["J1759-2922",null,0.5744002678086281,10,13,0.56,null],
        ["J1759-3107",null,1.0789555507012243,14,null,0.91,null],
        ["J1759-5505",null,0.3733921256520739,10.2,null,0.23,null],
        ["J1800+5034",null,0.5783751011451423,11.4,23.5,null,null],
        ["J1800-0059",null,1.1925438945337883,null,null,null,null],
        ["J1800-0125",null,0.78318548958,26.1,null,0.14,null],
        ["J1800-2114",null,1.7992724921644734,90,null,0.3,null],
        ["J1800-2343","B1757-23",1.03082,null,4,null,null],
        ["J1801-0108_P",null,1.072109,null,null,null,null],
        ["J1801-0144_P",null,0.00303345,null,null,null,null],
        ["J1801-0357","B1758-03",0.9214933945172117,9,17,0.7,null],
        ["J1801-0857A",null,0.007175614409039457,null,null,0.036,0.02],
        ["J1801-0857B",null,0.028961588466089216,null,null,0.012,0.009],
        ["J1801-0857C",null,0.0037386996395757516,null,null,0.012,0.007],
        ["J1801-0857D",null,0.004226532006104215,null,null,null,0.011],
        ["J1801-0857E",null,0.00760167049219618,null,null,null,null],
        ["J1801-0857F",null,0.024891985032455613,null,null,null,null],
        ["J1801-0857G",null,0.05159136667513397,null,null,null,null],
        ["J1801-0857H",null,0.00564272344430689,null,null,null,null],
        ["J1801-0857I",null,0.003254176096626981,null,null,null,null],
        ["J1801-0857K",null,0.009590488866882886,null,null,null,null],
        ["J1801-0857L",null,0.006057293037354809,null,null,null,null],
        ["J1801-0857M",null,0.005356836133518804,null,null,null,null],
        ["J1801-0857N",null,0.004994580300303615,null,null,null,null],
        ["J1801-0857O",null,0.0042871133331834075,null,null,null,null],
        ["J1801-1417",null,0.003625096717167488,0.6,null,1.54,null],
        ["J1801-1855",null,2.55049821044112,41.9,null,0.47,null],
        ["J1801-1909",null,1.1087248496026068,40,null,0.5,null],
        ["J1801-2115",null,0.4381131572413143,47,null,0.19,null],
        ["J1801-2154",null,0.3753017563561298,8.4,null,0.21,null],
        ["J1801-2304","B1758-23",0.4158270895434552,128.3,null,7,null],
        ["J1801-2451","B1757-24",0.12492420656941088,4.8,7.8,1.46,null],
        ["J1801-2920","B1758-29",1.0819110108335954,7.4,null,2.6,null],
        ["J1801-3210",null,0.007453584373464902,0.62,null,0.451,null],
        ["J1801-3458",null,1.385603623102647,47,null,0.11,null],
        ["J1802+0128",null,0.554261603931,null,null,null,null],
        ["J1802+03",null,0.6643,null,null,null,null],
        ["J1802-0523",null,1.68057296916,64.4,null,0.15,null],
        ["J1802-1745",null,0.5146713765189268,8.8,null,0.21,null],
        ["J1802-2124",null,0.012647593586522718,0.37,null,0.734,null],
        ["J1802-2426",null,0.5690070901849519,22.2,null,0.6,null],
        ["J1802-3346",null,2.461051995,76.6,null,0.2,null],
        ["J1803+1358",null,0.00152,null,null,null,null],
        ["J1803+47",null,0.3469,null,null,null,null],
        ["J1803-1616",null,0.5365958226734007,19,null,0.16,null],
        ["J1803-1857",null,2.8643377364779927,25.6,null,0.4,null],
        ["J1803-1920",null,0.4436489222511387,11,null,0.27,null],
        ["J1803-2137","B1800-21",0.13366692025028434,13,23,9.6,9.3],
        ["J1803-2149",null,0.10633405934573999,null,null,null,null],
        ["J1803-2712","B1800-27",0.3344154265054539,17,3.4,1.2,null],
        ["J1803-3002A",null,0.0071013925081179164,null,null,0.7,0.31],
        ["J1803-3002B",null,0.004397,null,null,null,null],
        ["J1803-3002C",null,0.005840403405803975,null,null,null,null],
        ["J1803-3002D",null,0.00553,null,null,0.028,null],
        ["J1803-3002E",null,0.017926,null,null,null,null],
        ["J1803-3002F",null,0.148136,null,null,null,null],
        ["J1803-3329",null,0.633411983159,13,null,null,null],
        ["J1803-4719",null,0.0036693711493223317,null,null,0.3,null],
        ["J1803-6707",null,0.0021346188308539434,null,null,null,null],
        ["J1804-0046_P",null,0.635152,null,null,null,null],
        ["J1804-0735","B1802-07",0.02310085528430001,3.7,3.1,1,null],
        ["J1804-17",null,0.28078084,41.7,null,0.24,null],
        ["J1804-2228",null,0.5705106334789584,27.3,null,0.2,null],
        ["J1804-2717",null,0.00934303084453923,1.55,15,0.4,null],
        ["J1804-28",null,1.273011,17,null,0.4,null],
        ["J1804-2858",null,0.0014926852841163519,null,null,0.918,null],
        ["J1805+0306","B1802+03",0.21871156549037443,7.7,5,null,null],
        ["J1805+0615",null,0.002128906459021764,null,null,null,null],
        ["J1805-0619",null,0.45465136830961045,15,null,0.9,null],
        ["J1805-1504",null,1.1812692298494554,229,null,3.7,null],
        ["J1805-2032",null,0.40576948790176576,26.3,null,0.7,null],
        ["J1805-2037",null,0.3578067749526543,13.2,null,0.34,null],
        ["J1805-2447",null,0.6614017590248853,11,null,0.27,null],
        ["J1805-2948",null,0.4283409894,9.2,null,0.2,null],
        ["J1806+1023",null,0.484286459778,2.4,null,null,null],
        ["J1806+2819",null,0.01508366732422,1.9,null,null,null],
        ["J1806-1154","B1804-12",0.5226195208187171,32,4,2.7,null],
        ["J1806-1618",null,0.6683092099228272,34,null,0.22,null],
        ["J1806-1920",null,0.8797908756443993,659.9,null,1.4,null],
        ["J1806-2125",null,0.48182460246828696,34,null,0.8,null],
        ["J1806-21250",null,0.172004,null,null,null,null],
        ["J1806-2133",null,0.3285584,84,null,0.23,null],
        ["J1807+04",null,0.7989,21.1,null,null,null],
        ["J1807+0756",null,0.464300493199,17.1,2.16,null,null],
        ["J1807-0847","B1804-08",0.16372737166367285,5.9,65,18,null],
        ["J1807-2459A",null,0.00305944879802023,0.33,null,1.1,0.6],
        ["J1807-2459B",null,0.0041861772028409,null,null,null,0.088],
        ["J1807-2557",null,2.76419486975,4,null,null,null],
        ["J1807-2715","B1804-27",0.8277864902158324,9.7,25,0.91,null],
        ["J1808+00",null,0.425115,13.6,null,null,null],
        ["J1808-0813",null,0.8760452134572837,23,28,1.6,null],
        ["J1808-1020",null,0.5969932025044894,9.3,null,0.23,null],
        ["J1808-14",null,0.836422,20,null,0.06,null],
        ["J1808-1517",null,0.5445502280818246,9,null,0.35,null],
        ["J1808-1726",null,0.24103454795056994,66,null,0.39,null],
        ["J1808-19",null,0.1016661,25,null,0.5,null],
        ["J1808-2024",null,7.55592,null,null,null,null],
        ["J1808-2057","B1805-20",0.9184103262857551,76,null,2.6,null],
        ["J1808-2701",null,2.4578817775848205,23,null,0.15,null],
        ["J1808-3249",null,0.3649170524975376,5,null,1.7,null],
        ["J1809+1705",null,2.066649687618704,20,null,null,null],
        ["J1809-0116_P",null,1.88738,null,null,0.0597,null],
        ["J1809-0119",null,0.7449764016,12,null,null,null],
        ["J1809-0743",null,0.313885674748,13,null,0.3,null],
        ["J1809-1429",null,0.8952888666594765,11,null,0.6,null],
        ["J1809-1850",null,1.1244810894365014,55,null,0.2,null],
        ["J1809-1917",null,0.08276415832565091,17,null,2.8,null],
        ["J1809-1943",null,5.540742829017983,150,null,0.7,null],
        ["J1809-20",null,0.05725621,7.4,null,0.17,null],
        ["J1809-2004",null,0.43481138632806426,46.3,null,0.9,null],
        ["J1809-2109","B1806-21",0.7024168725886758,8.9,null,0.84,null],
        ["J1809-2332",null,0.14678854811573636,null,null,null,null],
        ["J1809-3547",null,0.860387839,109,21,null,null],
        ["J1810+0705",null,0.30768283388,9.6,null,null,null],
        ["J1810+1744",null,0.0016627549909837,null,20,1.3,0.4],
        ["J1810-0100_P",null,1.10616,null,null,0.1229,null],
        ["J1810-1441",null,0.21721350035701467,14,null,0.21,null],
        ["J1810-1709",null,1.16113257983,134.2,null,0.45,null],
        ["J1810-1820",null,0.15371627836897858,7.8,null,0.7,null],
        ["J1810-2005",null,0.03282224486002241,7.2,null,1.33,null],
        ["J1810-5338","B1806-53",0.26104978958605507,6.6,12,null,null],
        ["J1811+0702",null,0.46171267661,12,2.2,null,null],
        ["J1811-0154",null,0.9249459126946703,19.8,null,0.7,null],
        ["J1811-0624",null,0.004145683548037471,null,null,0.102,null],
        ["J1811-1049",null,2.623858562,null,null,0.3,null],
        ["J1811-1717",null,0.39138510099,38.8,null,0.2,null],
        ["J1811-1736",null,0.1041819547968,13,null,1.3,null],
        ["J1811-1835",null,0.557463611996573,16.7,null,0.42,null],
        ["J1811-1925",null,0.064667,null,null,null,null],
        ["J1811-2405",null,0.00266059327687744,0.11,null,1.33,null],
        ["J1811-2439",null,0.41581294140194325,14,null,0.26,null],
        ["J1811-4930",null,1.4327050772410659,11,null,0.4,null],
        ["J1812+0226","B1810+02",0.7939028020345199,14.8,3.8,0.3,null],
        ["J1812-12",null,1.439967,23,null,0.05,null],
        ["J1812-15",null,1.014529,18.7,null,null,null],
        ["J1812-17",null,2.18201751,51.1,null,0.11,null],
        ["J1812-1718","B1809-173",1.2053744413670953,20,null,1.1,null],
        ["J1812-1733","B1809-176",0.5383413253854616,73,null,4.8,null],
        ["J1812-1910",null,0.430990980776862,28,null,0.28,null],
        ["J1812-20",null,1.9031119816,102.8,null,null,null],
        ["J1812-2102",null,1.2233523080723496,40.8,null,1.4,null],
        ["J1812-2526",null,0.3158350481966091,12,null,0.18,null],
        ["J1812-2748",null,0.236983307439,null,null,null,null],
        ["J1812-3039",null,0.58747677594,7.5,null,null,null],
        ["J1813+1822",null,0.3364246764,9.8,0.6,null,null],
        ["J1813+4013","B1811+40",0.9310890849358342,12.2,8,1.1,null],
        ["J1813-0402",null,0.0041065595383671825,null,null,0.148,null],
        ["J1813-0852",null,0.004226605265537366,null,null,82,null],
        ["J1813-1246",null,0.04807224675898413,null,null,null,null],
        ["J1813-14",null,1.035407,20,null,0.08,null],
        ["J1813-17",null,0.3675913,18.7,null,0.12,null],
        ["J1813-1749",null,0.04474055970362699,null,null,null,null],
        ["J1813-2113",null,0.42646775262274644,12,null,0.6,null],
        ["J1813-2242",null,0.32851421618308385,21,null,0.21,null],
        ["J1813-2621",null,0.0044300116286341,0.66,null,0.584,null],
        ["J1814+0045_P",null,0.00231,null,null,0.4464,null],
        ["J1814+1130",null,0.751261115038,8.6,0.72,null,null],
        ["J1814+2224",null,0.2537100587395312,3.6,null,null,null],
        ["J1814+31",null,0.00209,null,null,null,null],
        ["J1814-0521",null,1.01421948495,18,null,null,null],
        ["J1814-0618",null,1.377868495626031,48,null,0.58,null],
        ["J1814-1649",null,0.9574639353617023,27.1,null,1.3,null],
        ["J1814-1744",null,3.975905187575016,92,null,0.7,null],
        ["J1814-1845",null,1.089989,65,null,0.42,null],
        ["J1815+5546",null,0.4268438270611147,11,null,null,null],
        ["J1815-1738",null,0.19845697877642562,8.5,null,0.4,null],
        ["J1815-1910",null,1.249923537380637,25.4,null,0.32,null],
        ["J1816+0216_P",null,0.00404,null,null,0.0167,null],
        ["J1816+4510",null,0.0031931035571918314,0.2,1.5,null,null],
        ["J1816-0021_P",null,0.04165,null,null,0.0097,null],
        ["J1816-0038_P",null,0.03065,null,null,0.0278,null],
        ["J1816-0755",null,0.2176426911443729,4.2,null,0.17,null],
        ["J1816-1446",null,0.5944998158187551,25,null,0.23,null],
        ["J1816-1729","B1813-17",0.7823196417915232,16,null,1.3,null],
        ["J1816-2650","B1813-26",0.5928851906252041,40,18,2.38,null],
        ["J1816-5643",null,0.2179228818474,6.4,null,null,null],
        ["J1817-0012_P",null,0.65443,null,null,0.0851,null],
        ["J1817-0743",null,0.4380953469089431,13,null,0.25,null],
        ["J1817-1511",null,0.22460383718511817,21,null,0.43,null],
        ["J1817-1742",null,0.14974403939960185,null,null,null,null],
        ["J1817-19",null,1.229085,39,null,0.14,null],
        ["J1817-1932",null,1.229084876,null,null,null,null],
        ["J1817-1938",null,2.0468376289,null,null,0.1,null],
        ["J1817-2311","B1814-23",0.62547,null,4,null,null],
        ["J1817-3618","B1813-36",0.38701939745435454,9.4,22,3.2,null],
        ["J1817-3837",null,0.3844872829332803,5.3,12,2.09,null],
        ["J1818+03_P",null,0.79919,null,null,null,null],
        ["J1818-0051_P",null,2.20669,null,null,0.0103,null],
        ["J1818-0151",null,0.837534946983,12.3,null,0.09,null],
        ["J1818-1116",null,0.5447995246981143,25,null,0.5,null],
        ["J1818-1422","B1815-14",0.2914894606391399,17.1,null,9.6,null],
        ["J1818-1448",null,0.28137130037,45,null,0.19,null],
        ["J1818-1502",null,0.5725490895190058,24,null,null,null],
        ["J1818-1519",null,0.9396900396094725,130.4,null,2.1,null],
        ["J1818-1541",null,0.55113377674174,27.2,null,1,null],
        ["J1818-1556",null,0.952708902877,26,null,0.49,null],
        ["J1818-1607",null,1.363491957442689,40,null,0.2,null],
        ["J1819+0322",null,0.799165592815659,null,null,null,null],
        ["J1819+1305",null,1.0603638016829289,64,6.2,1.1,null],
        ["J1819-0040_P",null,0.16007,null,null,0.0798,null],
        ["J1819-0050_P",null,0.0066,null,null,0.2537,null],
        ["J1819-0925",null,0.852049474774231,22,null,0.72,null],
        ["J1819-1008",null,0.30148984927807604,12,null,0.35,null],
        ["J1819-1114",null,0.29416274100873957,21,null,1.07,null],
        ["J1819-1131",null,1.3881371285550816,64,null,0.15,null],
        ["J1819-1318",null,1.5156959926290585,23,null,0.16,null],
        ["J1819-1408",null,1.7884904527734455,116.8,null,0.5,null],
        ["J1819-1458",null,4.263213477392262,154,null,null,null],
        ["J1819-1510",null,0.2265389900749604,8.6,null,0.6,null],
        ["J1819-17",null,2.352135,87.1,null,0.14,null],
        ["J1819-1717",null,0.39352163764,31.5,null,0.26,null],
        ["J1819-37",null,0.632,9,null,null,null],
        ["J1820+0006_P",null,2.40495,null,null,0.1056,null],
        ["J1820+0058_P",null,0.03362,null,null,0.0181,null],
        ["J1820-0427","B1818-04",0.5980829208658979,9.3,157,10.07,null],
        ["J1820-0509",null,0.33732079579155316,8.2,null,0.25,null],
        ["J1820-1346","B1817-13",0.9214597313245398,37,null,2,null],
        ["J1820-1529",null,0.33325373434586986,32.2,null,0.83,null],
        ["J1820-1818","B1817-18",0.3099046719134909,15,null,1.5,null],
        ["J1820-19",null,0.00449080257,0.6,null,0.17,null],
        ["J1820-20",null,0.00269980185,0.5,null,0.17,null],
        ["J1821+0007_P",null,0.00422,null,null,3.0455,null],
        ["J1821+0017_P",null,0.00756,null,null,0.0074,null],
        ["J1821+0044_P",null,0.00271,null,null,0.0156,null],
        ["J1821+0155",null,0.03378133193189,0.5,null,0.29,null],
        ["J1821+1715",null,1.366682059422,45,3.7,null,null],
        ["J1821+4147",null,1.2618572091336433,49,null,null,null],
        ["J1821-0013_P",null,2.21759,null,null,0.0132,null],
        ["J1821-0031_P",null,4.44088,null,null,0.0079,null],
        ["J1821-0256",null,0.4141110498431774,9.9,null,0.19,null],
        ["J1821-0331",null,0.90231562918,16,null,0.2,null],
        ["J1821-1419",null,1.656009569709682,99,null,0.2,null],
        ["J1821-1432",null,1.91513066964,39,null,0.22,null],
        ["J1822+0044_P",null,0.99889,null,null,0.031,null],
        ["J1822+02",null,1.508,62,null,null,null],
        ["J1822+0207_P",null,0.0099,null,null,0.0983,null],
        ["J1822+0705",null,1.362817392033239,6.8,3.8,null,null],
        ["J1822+1120",null,1.78703680542,24,0.5,null,null],
        ["J1822+2617",null,0.591417585722212,2.3,null,null,null],
        ["J1822-0719",null,0.49907553362,10.1,null,null,null],
        ["J1822-0848",null,0.834839272621,18,null,0.04,null],
        ["J1822-0902",null,0.148894507003,5.25,null,null,null],
        ["J1822-0907",null,0.9747003733631099,28,null,0.12,null],
        ["J1822-1252",null,2.071040272488777,105,null,0.25,null],
        ["J1822-1400","B1820-14",0.21477110978897967,7.1,null,0.8,null],
        ["J1822-1604",null,8.437721056426133,null,null,null,null],
        ["J1822-1617",null,0.8311557274223764,115,null,0.2,null],
        ["J1822-2256","B1819-22",1.874268518251891,43.7,25,3.8,null],
        ["J1822-4209",null,0.4565123632528818,8,7,0.9,null],
        ["J1823+0048_P",null,0.91795,null,null,0.0155,null],
        ["J1823+0550","B1821+05",0.7529067642078727,46,18,1.7,null],
        ["J1823-0154",null,0.7597783116616478,5.1,13,0.78,null],
        ["J1823-11",null,0.2861844,83,null,0.3,null],
        ["J1823-1115","B1820-11",0.27982869656534903,26,11,3.2,null],
        ["J1823-1126",null,1.8465342014616548,23,null,0.51,null],
        ["J1823-1347",null,0.6171072055520304,34.6,null,0.41,null],
        ["J1823-1526",null,1.625405472403679,41,null,0.47,null],
        ["J1823-1807",null,1.636792451719795,34.6,null,0.39,null],
        ["J1823-3021A","B1820-30A",0.005440004163273,0.34,16,0.72,0.08],
        ["J1823-3021B","B1820-30B",0.378596492197,6,2.2,0.07,0.08],
        ["J1823-3021C",null,0.40593596299,null,null,null,0.037],
        ["J1823-3021D",null,0.00302006026098,null,null,null,0.029],
        ["J1823-3021E",null,0.004394,null,null,null,null],
        ["J1823-3021F",null,0.00485,null,null,null,null],
        ["J1823-3021G",null,0.006091293421513293,null,null,0.047,null],
        ["J1823-3021H",null,0.00513,null,null,0.031,null],
        ["J1823-3106","B1820-31",0.2840567050047825,4.4,36,5.6,null],
        ["J1823-3543",null,0.0023733092028986246,null,null,null,null],
        ["J1824+1014",null,0.004065916139472175,null,null,null,null],
        ["J1824-0117_P",null,1.37445,null,null,0.0109,null],
        ["J1824-0127",null,2.499470453902642,11.8,null,0.59,null],
        ["J1824-0132",null,0.223728519703,8,null,0.12,null],
        ["J1824-0621",null,0.0032330162292687928,null,null,0.114,null],
        ["J1824-1118","B1821-11",0.43575903331118826,15,null,1.3,null],
        ["J1824-1159",null,0.3624920782244963,11,null,0.7,null],
        ["J1824-1350",null,1.39659854604,29,null,0.08,null],
        ["J1824-1423",null,0.3593941624571582,11,null,0.8,null],
        ["J1824-1500",null,0.41222995857016115,18,null,0.16,null],
        ["J1824-1945","B1821-19",0.18933744109122613,1.7,71,7.8,null],
        ["J1824-2233",null,1.1617431097148179,13,null,0.22,null],
        ["J1824-2328",null,1.5058745516940706,35,null,0.32,null],
        ["J1824-2452A","B1821-24A",0.0030543157577371614,0.972,40,2.3,null],
        ["J1824-2452B",null,0.006547,null,null,null,null],
        ["J1824-2452C",null,0.004159,null,null,null,null],
        ["J1824-2452D",null,0.079832,null,null,null,null],
        ["J1824-2452E",null,0.00542,null,null,null,null],
        ["J1824-2452F",null,0.002451,null,null,null,null],
        ["J1824-2452G",null,0.005909,null,null,null,null],
        ["J1824-2452H",null,0.004629,null,null,null,null],
        ["J1824-2452I",null,0.003931852642,null,null,null,null],
        ["J1824-2452J",null,0.004039,null,null,null,null],
        ["J1824-2452K",null,0.004461,null,null,null,null],
        ["J1824-2452L",null,0.0041,null,null,null,null],
        ["J1824-2452M",null,0.004784284298278529,null,null,null,0.006],
        ["J1824-2452N",null,0.0033528724368609947,null,null,null,0.01],
        ["J1824-2537",null,0.223320267185,5.8,null,null,null],
        ["J1825+0004","B1822+00",0.778950144386017,8.4,8,0.4,null],
        ["J1825+0057_P",null,0.00602,null,null,0.0172,null],
        ["J1825-0208_P",null,3.30735,null,null,0.0203,null],
        ["J1825-0254_P",null,0.09672,null,null,0.0905,null],
        ["J1825-0319",null,0.004553527919736,0.149,null,0.183,null],
        ["J1825-0935","B1822-09",0.7690209983270947,11,36,10,null],
        ["J1825-1108",null,1.9258717727,42.1,null,0.13,null],
        ["J1825-1446","B1822-14",0.2792063112083088,9.8,null,2.9,null],
        ["J1825-31",null,2.382,47,null,null,null],
        ["J1825-33",null,1.2712,null,null,null,null],
        ["J1826-0049",null,0.004590843938856423,null,null,null,null],
        ["J1826-0132_P",null,0.36325,null,null,0.0607,null],
        ["J1826-1131","B1823-11",2.093140556117859,29,5,0.71,null],
        ["J1826-1256",null,0.11023863976424748,null,null,null,null],
        ["J1826-1334","B1823-13",0.10148679420759428,5.9,null,4.7,null],
        ["J1826-1419",null,0.770620171033,2,null,null,null],
        ["J1826-1526",null,0.3820728121156708,13.4,null,0.46,null],
        ["J1826-2415",null,0.0046957571305605,0.361,null,0.49,null],
        ["J1827+00_P",null,0.37517,null,null,null,null],
        ["J1827-0125_P",null,0.33796,null,null,0.1845,null],
        ["J1827-0216_P",null,0.28548,null,null,0.0262,null],
        ["J1827-0750",null,0.27050286944435303,9.5,null,2.9,null],
        ["J1827-0849",null,0.0022424697684062557,null,null,null,null],
        ["J1827-0934",null,0.512547817783726,23,null,0.29,null],
        ["J1827-0958","B1824-10",0.2457571181422795,26,null,2.2,null],
        ["J1827-1446",null,0.4991866103614787,null,null,null,null],
        ["J1828+0020_P",null,0.00294,null,null,0.0095,null],
        ["J1828+0157_P",null,1.90397,null,null,0.0045,null],
        ["J1828+0218_P",null,0.00297,null,null,0.0308,null],
        ["J1828+0625",null,0.003627562557558189,0.5,null,0.32,null],
        ["J1828+1221",null,1.5282950805836577,28.4,null,0.5,null],
        ["J1828+1359",null,0.741639520385,15,1.2,null,null],
        ["J1828-0003",null,3.8071162617164003,null,null,null,null],
        ["J1828-0038_P",null,2.426,null,null,0.0078,null],
        ["J1828-0611",null,0.26941566307920006,9.5,null,1.5,null],
        ["J1828-1007",null,0.15319697924142572,8.7,null,0.21,null],
        ["J1828-1057",null,0.2463332571567106,15,null,0.33,null],
        ["J1828-1101",null,0.07206169357754665,7.5,null,2.3,null],
        ["J1828-1336",null,0.8603321159906617,34.6,null,0.26,null],
        ["J1828-2119",null,0.5145230695044655,24,null,0.38,null],
        ["J1829+0000",null,0.19914739705187687,16,null,0.54,null],
        ["J1829+2456",null,0.04100982358117,0.4,0.3,0.037,null],
        ["J1829+25",null,2.857,34,null,null,null],
        ["J1829-0116_P",null,1.6532,null,null,0.0111,null],
        ["J1829-0235_P",null,0.00743,null,null,0.0757,null],
        ["J1829-0734",null,0.3184039679155462,5,null,0.45,null],
        ["J1829-1011",null,0.82916602078,98.8,null,0.25,null],
        ["J1829-1751","B1826-17",0.3071375466320042,14,78,11,null],
        ["J1830-0052",null,0.34569803402064575,10.5,null,0.04,null],
        ["J1830-0106_P",null,0.00176,null,null,0.2545,null],
        ["J1830-0131",null,0.45753932108252954,null,null,0.35,null],
        ["J1830-0156_P",null,0.00752,null,null,0.0203,null],
        ["J1830-0206_P",null,1.05534,null,null,0.0083,null],
        ["J1830-0231_P",null,null,null,null,null,null],
        ["J1830-09",null,0.6954903,13.4,null,0.1,null],
        ["J1830-10",null,0.24526,5.36,null,0.1,null],
        ["J1830-1059","B1828-11",0.40509398295297266,3.2,2.1,1.5,null],
        ["J1830-1135",null,6.221552666300743,62.2,null,1.1,null],
        ["J1830-1313",null,0.7471876682,38,null,0.26,null],
        ["J1830-14",null,0.3998483,20,null,0.07,null],
        ["J1830-1414",null,0.7714925203759145,10,null,0.1,null],
        ["J1831+0101_P",null,0.18228,null,null,0.0177,null],
        ["J1831+0204_P",null,0.00208,null,null,0.0175,null],
        ["J1831+0222_P",null,2.31514,null,null,0.0352,null],
        ["J1831+0304_P",null,0.83712,null,null,0.0133,null],
        ["J1831-04",null,1.065578,15.3,null,null,null],
        ["J1831-0823",null,0.6121331804246037,13,null,1,null],
        ["J1831-0941",null,0.3008716560992735,25.7,null,null,null],
        ["J1831-0952",null,0.06726684611517557,10,null,0.35,null],
        ["J1831-1223",null,2.857941001266995,92.1,null,1.2,null],
        ["J1831-1329",null,2.1656793503106737,47.1,null,0.5,null],
        ["J1831-1423",null,0.5079451952428784,23,null,0.19,null],
        ["J1832+0029",null,0.5339177330963012,7,null,0.14,null],
        ["J1832+0113_P",null,0.00634,null,null,0.0414,null],
        ["J1832+0204_P",null,1.21279,null,null,0.051,null],
        ["J1832+27",null,0.6318,21.9,null,null,null],
        ["J1832-0644",null,0.7443207475625515,28,null,0.7,null],
        ["J1832-0827","B1829-08",0.6473255991879202,5.1,9.4,4,null],
        ["J1832-0836",null,0.0027191120210188296,0.058,null,0.92,null],
        ["J1832-1021","B1829-10",0.33035408944316885,8.1,3.4,1.9,null],
        ["J1832-28",null,0.1993,11.8,null,null,null],
        ["J1833+0050_P",null,0.9037,null,null,0.0163,null],
        ["J1833-0046_P",null,0.00295,null,null,0.6736,null],
        ["J1833-0204_P",null,0.00443,null,null,0.0266,null],
        ["J1833-0209",null,0.291930632181,null,null,0.06,null],
        ["J1833-0338","B1831-03",0.6867393004257302,5.4,89,2.8,null],
        ["J1833-05",null,0.744883,32,null,0.09,null],
        ["J1833-0556",null,1.521545169747569,69,null,0.2,null],
        ["J1833-0559",null,0.4834588800794525,47,null,0.6,null],
        ["J1833-0827","B1830-08",0.08529132231748929,4.6,null,6.9,null],
        ["J1833-0831",null,7.565408383657232,null,null,null,null],
        ["J1833-1034",null,0.06188365001063282,2.3,null,0.071,null],
        ["J1833-1055",null,0.6336402981719819,24.2,null,0.5,null],
        ["J1833-3840",null,0.001866067215860722,null,null,0.38,null],
        ["J1833-6023","B1828-60",1.8894355004,58,5.5,1.459,null],
        ["J1834+0143_P",null,0.00464,null,null,0.0277,null],
        ["J1834+0148_P",null,0.16198,null,null,0.1279,null],
        ["J1834+0248_P",null,0.37556,null,null,0.0078,null],
        ["J1834+10",null,1.172719,41.8,null,null,null],
        ["J1834-0010","B1831-00",0.5209543111288175,40,5.1,0.29,null],
        ["J1834-0031",null,0.3295319224881146,4.8,null,0.17,null],
        ["J1834-0426","B1831-04",0.2901082578802207,88,77,19.69,null],
        ["J1834-0602",null,0.4879135916993522,16.8,null,0.8,null],
        ["J1834-0633",null,0.3173148827919981,101.6,null,0.28,null],
        ["J1834-0731",null,0.5129952702786045,40,null,1.3,null],
        ["J1834-0742",null,0.7883739237346321,26,null,0.35,null],
        ["J1834-0812",null,0.4911415563,null,null,null,null],
        ["J1834-0845",null,2.4823018,null,null,null,null],
        ["J1834-09",null,0.5123273,64.5,null,0.17,null],
        ["J1834-1202",null,0.6102587957112944,60,null,0.7,null],
        ["J1834-1710",null,0.358306049291,12.2,null,0.7,null],
        ["J1834-1855",null,1.4656557713318956,32,null,0.39,null],
        ["J1835+0005_P",null,0.02654,null,null,0.0194,null],
        ["J1835+00_P",null,0.79007,null,null,null,null],
        ["J1835+0114_P",null,2.19976,null,null,0.0026,null],
        ["J1835+0158_P",null,0.00332,null,null,0.0437,null],
        ["J1835+0301_P",null,2.29889,null,null,0.0188,null],
        ["J1835-0011_P",null,0.00323,null,null,0.2055,null],
        ["J1835-0113_P",null,0.59963,null,null,0.0548,null],
        ["J1835-0114",null,0.005116387644239,0.4,null,0.373,null],
        ["J1835-0149_P",null,1.27761,null,null,0.0213,null],
        ["J1835-0349",null,0.8418645185892316,14,null,0.16,null],
        ["J1835-0522",null,1.087749188408619,23,null,0.23,null],
        ["J1835-0600",null,2.2217871479,29,null,null,null],
        ["J1835-0643","B1832-06",0.3058300977124275,37,null,2.3,null],
        ["J1835-0847",null,0.84649413462,46,null,0.4,null],
        ["J1835-09",null,0.750462,120,null,0.2,null],
        ["J1835-0924",null,0.859192035203777,41.6,null,0.55,null],
        ["J1835-09242",null,0.235248924972,27.1,null,null,null],
        ["J1835-0928",null,0.62173399423,39.5,null,null,null],
        ["J1835-0944",null,0.14534738034011652,7,null,0.6,null],
        ["J1835-0946",null,0.3795361060144529,4,null,0.18,null],
        ["J1835-1020",null,0.3024521567005404,5.3,null,1.9,null],
        ["J1835-1106",null,0.16591763483912988,3.9,30,2.5,null],
        ["J1835-1548",null,0.6704856623947044,17,null,0.06,null],
        ["J1835-3259A",null,0.003889,null,null,null,null],
        ["J1835-3259B",null,0.001830293079929302,0.4,null,null,null],
        ["J1836+0014_P",null,0.53046,null,null,0.0193,null],
        ["J1836+0015_P",null,0.62952,null,null,0.0281,null],
        ["J1836+0117_P",null,0.00381,null,null,0.0582,null],
        ["J1836+0352_P",null,0.4491,null,null,0.0383,null],
        ["J1836+0915",null,0.5411777935145292,6,null,0.048,null],
        ["J1836+51",null,0.692,19,null,null,null],
        ["J1836+5925",null,0.17326383602819814,null,null,null,null],
        ["J1836-0011_P",null,0.9396,null,null,0.0034,null],
        ["J1836-0100_P",null,0.25852,null,null,0.0513,null],
        ["J1836-0150_P",null,0.00546,null,null,0.6616,null],
        ["J1836-0436","B1834-04",0.35423792884504646,9.3,null,2,null],
        ["J1836-0517",null,0.457245030441823,13,null,0.15,null],
        ["J1836-1008","B1834-10",0.5627214578257497,7.7,54,4.8,null],
        ["J1836-11",null,0.4961931,25.7,null,0.12,null],
        ["J1836-1324",null,0.17875635177314395,1.6,null,0.1,null],
        ["J1836-2354A",null,0.0033543360829062,null,null,0.2,0.073],
        ["J1836-2354B",null,0.003232273969155,null,null,0.04,0.043],
        ["J1837+0033",null,0.418131244964,null,null,0.0331,null],
        ["J1837+0053",null,0.47351252978296055,44.8,null,0.34,null],
        ["J1837+0250_P",null,0.09466,null,null,0.0089,null],
        ["J1837+03",null,0.0107,null,null,null,null],
        ["J1837+0420_P",null,1.00949,null,null,0.0071,null],
        ["J1837+0528_P",null,0.00626,null,null,0.0189,null],
        ["J1837+10",null,1.707,null,null,null,null],
        ["J1837+1221",null,1.9635361612516231,9.8,null,0.5,null],
        ["J1837-0045",null,0.6170379253525852,6,10,0.5,null],
        ["J1837-0048_P",null,0.00273,null,null,0.331,null],
        ["J1837-0219",null,0.2723493082518416,null,null,0.042,null],
        ["J1837-0559",null,0.2010648455992874,9,null,0.58,null],
        ["J1837-0604",null,0.0963128051971849,14,null,0.75,null],
        ["J1837-0653","B1834-06",1.9058093971331647,54,null,3.5,null],
        ["J1837-0822",null,1.099195959243,49,null,0.2,null],
        ["J1837-10",null,1.016605,36,null,0.07,null],
        ["J1837-1243",null,1.8760185243541814,24.4,null,0.17,null],
        ["J1837-1837",null,0.6183614585853084,7.9,null,0.4,null],
        ["J1838+0022_P",null,0.00509,null,null,0.032,null],
        ["J1838+0024",null,0.005087126153857499,1.3,null,null,null],
        ["J1838+0027_P",null,0.05413,null,null,0.007,null],
        ["J1838+0028_P",null,0.00187,null,null,0.2556,null],
        ["J1838+0044_P",null,2.20317,1.7,null,0.073,null],
        ["J1838+0226_P",null,2.12258,null,null,0.0591,null],
        ["J1838+0228_P",null,0.65316,null,null,0.0242,null],
        ["J1838+1507_P",null,0.00382,null,null,0.3621,null],
        ["J1838+1523",null,0.5491606020001913,9.4,null,null,null],
        ["J1838+1650",null,1.90196739931,72,2.6,null,null],
        ["J1838+50",null,2.577223412,13,null,null,null],
        ["J1838-0014_P",null,0.36045,null,null,0.1178,null],
        ["J1838-01",null,0.1832948,1.4,null,0.3,null],
        ["J1838-0107",null,0.4444257246169,4.6,null,0.05,null],
        ["J1838-0156_P",null,0.00551,null,null,0.0237,null],
        ["J1838-0453",null,0.38086561316403156,15,null,0.4,null],
        ["J1838-0537",null,0.14575448633081353,null,null,null,null],
        ["J1838-0549",null,0.2353113806030848,7.6,null,0.42,null],
        ["J1838-0624",null,0.9271777415095478,36,null,0.16,null],
        ["J1838-0655",null,0.07049824397,null,null,null,null],
        ["J1838-1046",null,1.2183535963166587,16.6,null,0.5,null],
        ["J1838-1849",null,0.48824200896,null,null,0.4,null],
        ["J1839+0050_P",null,0.63331,null,null,0.0125,null],
        ["J1839+0100_P",null,0.00537,null,null,0.8294,null],
        ["J1839+0221_P",null,0.27277,null,null,0.0461,null],
        ["J1839+0543",null,0.05792795300170316,null,null,null,null],
        ["J1839-0141",null,0.93326558076,13,null,null,null],
        ["J1839-0223",null,1.26679012424,42,null,0.11,null],
        ["J1839-0321",null,0.23878218346371655,7,null,0.27,null],
        ["J1839-0332",null,2.67568226451,31,null,null,null],
        ["J1839-0402",null,0.5209396795467541,7.6,null,0.21,null],
        ["J1839-0436",null,0.14946065576197806,6.9,null,0.23,null],
        ["J1839-0459",null,0.5853190378249676,22,null,0.3,null],
        ["J1839-0627",null,0.48491367907688493,19,null,0.29,null],
        ["J1839-0643",null,0.449548149848491,24,null,1.6,null],
        ["J1839-0905",null,0.41897490364130824,18,null,0.22,null],
        ["J1839-1238",null,1.911430772996209,28,null,0.37,null],
        ["J1840+0012_P",null,0.005338973169887382,2.87,null,0.165,null],
        ["J1840+0151_P",null,1.75041,null,null,0.0206,null],
        ["J1840+0214",null,0.7974780753035112,10,null,0.07,null],
        ["J1840+0351_P",null,0.00516,null,null,0.0746,null],
        ["J1840+03_P",null,0.00583,null,null,null,null],
        ["J1840+2843",null,0.6861018210083456,null,null,null,null],
        ["J1840+5640","B1839+56",1.6528618528869268,27.1,21,4,null],
        ["J1840-0049_P",null,0.00676,null,null,0.0615,null],
        ["J1840-0140_P",null,1.92682,null,null,0.0183,null],
        ["J1840-0144_P",null,1.10169,null,null,0.0159,null],
        ["J1840-0245_P",null,1.502,null,null,0.0067,null],
        ["J1840-0445",null,0.42231632097,22.4,null,0.37,null],
        ["J1840-0559",null,0.859368466807663,17,null,0.31,null],
        ["J1840-0626",null,1.8933526999,37,null,0.16,null],
        ["J1840-0643",null,0.035577873274507406,null,null,1.2,null],
        ["J1840-0753",null,0.4378690017,140.1,null,0.37,null],
        ["J1840-0809",null,0.9556736347129944,9.3,null,2.5,null],
        ["J1840-0815",null,1.0964415181973268,24,null,1.9,null],
        ["J1840-0840",null,5.309376684684634,188,null,1.72,null],
        ["J1840-09",null,0.0030891006,1.7,null,0.26,null],
        ["J1840-1122",null,0.9409616166112345,10,null,0.13,null],
        ["J1840-1207",null,0.7544704271922604,15,null,0.22,null],
        ["J1840-1419",null,6.597562522421646,2.6,null,null,null],
        ["J1841+0112_P",null,0.17842,null,null,0.119,null],
        ["J1841+0130",null,0.029772775333215356,6,null,0.06,null],
        ["J1841+0217_P",null,0.29672,null,null,0.0164,null],
        ["J1841+0235_P",null,0.25863,null,null,0.0128,null],
        ["J1841+0912","B1839+09",0.3813203489970439,9.4,20,1.7,null],
        ["J1841-0053_P",null,1.43289,null,null,0.0353,null],
        ["J1841-0123_P",null,0.00379,null,null,0.816,null],
        ["J1841-0157",null,0.6633323828597029,21.2,null,0.81,null],
        ["J1841-0238_P",null,0.88404,null,null,0.0108,null],
        ["J1841-0258_P",null,0.5963,null,null,0.0961,null],
        ["J1841-0310",null,1.6576564581631081,59,null,0.15,null],
        ["J1841-0345",null,0.2041060756914787,12,null,2.07,null],
        ["J1841-04",null,null,null,null,null,null],
        ["J1841-0425","B1838-04",0.18614885795626024,4.9,2.6,3.3,null],
        ["J1841-0456",null,11.788978418058678,null,null,null,null],
        ["J1841-05",null,1.08851,27,null,0.06,null],
        ["J1841-0500",null,0.9129158020812091,null,null,null,5.4],
        ["J1841-0524",null,0.4458097013268157,16,null,0.2,null],
        ["J1841-1404",null,1.3345572305018096,17,null,0.18,null],
        ["J1841-7845",null,0.3536025329,22,null,0.4,null],
        ["J1842+0114_P",null,4.14,null,null,0.0089,null],
        ["J1842+0131_P",null,1.59027,null,null,0.0306,null],
        ["J1842+0257",null,3.0882557929477428,51.5,null,0.26,null],
        ["J1842+0357_P",null,0.67253,null,null,0.0121,null],
        ["J1842+0358",null,0.23332620667927467,3.2,null,0.09,null],
        ["J1842+0407_P",null,0.00394,null,null,0.3022,null],
        ["J1842+0638",null,0.31301640103785405,13.3,null,0.21,null],
        ["J1842+1332",null,0.47160373318343557,94.3,null,1,null],
        ["J1842-0138_P",null,0.00271,null,null,0.1573,null],
        ["J1842-0148_P",null,0.42894,null,null,0.0517,null],
        ["J1842-0153",null,1.0542282503787483,24,null,0.6,null],
        ["J1842-0309",null,0.4049196437211607,43,null,0.25,null],
        ["J1842-0359","B1839-04",1.8399447011854722,280,18.7,4.4,null],
        ["J1842-0415",null,0.5266822415746949,10,null,0.35,null],
        ["J1842-06",null,0.3607766,13,null,0.06,null],
        ["J1842-0612",null,0.5644753799870378,53,null,0.54,null],
        ["J1842-0800",null,1.25546857429,15,null,0.1,null],
        ["J1842-0905",null,0.34464963868504694,6.1,null,1.04,null],
        ["J1842-27",null,0.815269,null,null,null,null],
        ["J1842-39",null,0.374,18,null,null,null],
        ["J1843+0119",null,1.26699835538,41,null,0.063,null],
        ["J1843+0333_P",null,0.82325,null,null,0.0139,null],
        ["J1843+0526_P",null,2.03497,null,null,0.0256,null],
        ["J1843+2024",null,3.4065386707,47,0.37,null,null],
        ["J1843-0000",null,0.8803355288482932,25.4,null,3.8,null],
        ["J1843-0038_P",null,0.58558,null,null,0.1182,null],
        ["J1843-0050",null,0.7825984686111523,20.6,null,0.24,null],
        ["J1843-0051_P",null,0.58,null,null,0.006,null],
        ["J1843-0128_P",null,2.16489,null,null,0.0445,null],
        ["J1843-0137",null,0.6698723866538295,18.6,null,0.26,null],
        ["J1843-0147_P",null,null,null,null,null,null],
        ["J1843-0157_P",null,0.50886,null,null,0.209,null],
        ["J1843-0207_P",null,0.45731,null,null,0.0344,null],
        ["J1843-0211",null,2.0275328923333866,17.5,null,0.93,null],
        ["J1843-0236_P",null,0.94609,null,null,0.0231,null],
        ["J1843-0310_P",null,0.28515,null,null,0.1477,null],
        ["J1843-0355",null,0.13231397192751146,19.1,null,0.89,null],
        ["J1843-0408",null,0.7819336997294549,12,null,0.17,null],
        ["J1843-0459",null,0.7549639493524505,60,null,1.9,null],
        ["J1843-0510",null,0.671613828819,28,null,0.07,null],
        ["J1843-0702",null,0.19161457777128288,3.7,null,0.27,null],
        ["J1843-0744",null,0.475392526561,9.3,null,0.17,null],
        ["J1843-0757",null,2.03194008516,31.8,null,0.09,null],
        ["J1843-0806",null,0.5364237815304105,20,null,0.36,null],
        ["J1843-1113",null,0.0018456663232095899,0.25,null,0.1,null],
        ["J1843-1448",null,0.0054713308755095,1,null,0.486,null],
        ["J1843-1507",null,0.5835503773621201,6.3,null,0.17,null],
        ["J1843-40",null,0.324187,null,null,null,null],
        ["J1844+00",null,0.460503,5.9,null,8.6,null],
        ["J1844+0028",null,0.0035706717591044634,0.61,null,0.054,null],
        ["J1844+0115",null,0.0041855439366642105,0.3,null,0.094,null],
        ["J1844+0144_P",null,1.5056,null,null,0.0151,null],
        ["J1844+0315_P",null,0.31891,null,null,0.0264,null],
        ["J1844+0455_P",null,0.0047,null,null,0.0224,null],
        ["J1844+1454","B1842+14",0.3754650057709996,11.6,20,1.8,null],
        ["J1844+21",null,0.5959,null,null,null,null],
        ["J1844+41",null,0.9157,300,null,null,null],
        ["J1844-0030",null,0.6411014300188722,13.9,null,0.42,null],
        ["J1844-0127_P",null,0.02914,null,null,0.0877,null],
        ["J1844-0128",null,0.029144422369607837,1.5,null,null,null],
        ["J1844-0134_P",null,2.6972,null,null,0.0153,null],
        ["J1844-0136_P",null,0.41724,null,null,0.0596,null],
        ["J1844-0142_P",null,0.34872,null,null,0.0546,null],
        ["J1844-02",null,0.5815353,24,null,0.07,null],
        ["J1844-0202_P",null,0.76145,null,null,0.0301,null],
        ["J1844-0223_P",null,0.92499,null,null,0.0543,null],
        ["J1844-0244","B1842-02",0.5077223221176956,19.4,null,1.1,null],
        ["J1844-0256",null,0.272963,51,null,0.59,null],
        ["J1844-03",null,6.9713,null,null,null,null],
        ["J1844-0302",null,1.19863027492,23,null,0.12,null],
        ["J1844-0310",null,0.5250491427357044,20.4,null,0.53,null],
        ["J1844-0346",null,0.11285464990490733,null,null,null,null],
        ["J1844-0433","B1841-04",0.9910299372729777,12,8.1,1.1,null],
        ["J1844-0452",null,0.2694433214084231,16,null,0.19,null],
        ["J1844-0502",null,0.33516252824575715,24,null,0.4,null],
        ["J1844-0538","B1841-05",0.25570418558618535,8.5,null,3.2,null],
        ["J1844-09",null,0.6344454,15,null,0.05,null],
        ["J1845+0104_P",null,0.00671,null,null,0.1026,null],
        ["J1845+0201_P",null,0.004309250408179472,1.66,null,0.9669,null],
        ["J1845+0317_P",null,0.0018507022354996238,0.33,null,0.4804,null],
        ["J1845+0326_P",null,0.968,null,null,0.0033,null],
        ["J1845+0417_P",null,1.697,null,null,0.0031,null],
        ["J1845+0623",null,1.42165410139031,10.7,null,0.33,null],
        ["J1845+21",null,3.7556,null,null,null,null],
        ["J1845-0008_P",null,1.268,null,null,0.0096,null],
        ["J1845-0028_P",null,0.0845,null,null,0.01,null],
        ["J1845-0103_P",null,0.09906,null,null,0.35,null],
        ["J1845-0118_P",null,1.71873,null,null,0.0249,null],
        ["J1845-0142_P",null,0.1262,null,null,0.0702,null],
        ["J1845-0144_P",null,0.59396,null,null,0.5865,null],
        ["J1845-0229A_P",null,0.65772,null,null,0.1374,null],
        ["J1845-0229B_P",null,0.46305,null,null,0.0871,null],
        ["J1845-0243_P",null,0.34526,null,null,0.12,null],
        ["J1845-0254_P",null,0.49266,null,null,0.09,null],
        ["J1845-0316",null,0.2076357201,12,null,0.35,null],
        ["J1845-0434","B1842-04",0.4867603820270815,16,null,2.92,null],
        ["J1845-0545",null,1.0923560859236454,18,null,0.47,null],
        ["J1845-0635",null,0.34052942130624014,11,null,0.36,null],
        ["J1845-0743",null,0.10469465215795112,2,2.5,3,null],
        ["J1845-0826",null,0.6343543467670825,15,null,0.33,null],
        ["J1845-1114",null,0.2062210872139195,3.2,null,0.52,null],
        ["J1845-1351",null,2.618918467260495,63,null,0.33,null],
        ["J1846+0014_P",null,0.00666,null,null,0.0333,null],
        ["J1846+0051",null,0.43437952041599404,12.7,null,0.34,null],
        ["J1846+0153_P",null,2.05252,null,null,0.0112,null],
        ["J1846+0336_P",null,1.51273,null,null,0.0067,null],
        ["J1846+0507_P",null,0.00307,null,null,0.0836,null],
        ["J1846+0657_P",null,2.24405,null,null,0.0391,null],
        ["J1846+0919",null,0.2255521010750778,null,null,null,null],
        ["J1846-00_P",null,0.02124,null,null,null,null],
        ["J1846-0200_P",null,0.66839,null,null,0.011,null],
        ["J1846-0211_P",null,0.78817,null,null,0.0989,null],
        ["J1846-0253_P",null,2.20944,null,null,0.0302,null],
        ["J1846-0257",null,4.4767225398,39,null,null,null],
        ["J1846-0258",null,0.3265712883437141,null,null,null,null],
        ["J1846-05",null,1.444985,33,null,0.09,null],
        ["J1846-0500",null,0.4766359590098538,null,null,null,null],
        ["J1846-0513",null,0.02336953929079767,null,null,null,null],
        ["J1846-0749",null,0.3501095728522712,6.2,null,0.35,null],
        ["J1846-07492",null,0.861379642641,19,null,0.19,null],
        ["J1846-4249",null,2.273,30.9,null,0.2,null],
        ["J1846-7403",null,4.8788385261,609.9,null,2.9,null],
        ["J1847+01",null,0.0034630711,0.2,null,null,null],
        ["J1847+0110_P",null,0.00653,null,null,0.037,null],
        ["J1847+0133_P",null,2.84691,3.2,null,0.01,null],
        ["J1847+0148_P",null,0.60246,null,null,0.0219,null],
        ["J1847+0342_P",null,0.00429,null,null,0.2028,null],
        ["J1847+0614_P",null,1.66302,6.9,null,0.051,null],
        ["J1847-0046_P",null,null,null,null,null,null],
        ["J1847-0048_P",null,0.58247,null,null,0.2864,null],
        ["J1847-0052_P",null,0.33253,null,null,0.112,null],
        ["J1847-0130",null,6.707045724099338,192,null,0.33,null],
        ["J1847-0308_P",null,29.7693,null,null,0.0207,null],
        ["J1847-0402","B1844-04",0.5978087541476929,20,75,4.9,null],
        ["J1847-0427",null,0.25924664288,30.9,null,null,null],
        ["J1847-0438",null,0.9579988205764289,11,null,0.5,null],
        ["J1847-0443",null,0.3408321304412069,12,null,0.16,null],
        ["J1847-05",null,2.61807,39,null,0.04,null],
        ["J1847-0605",null,0.7781674459389979,12,null,0.8,null],
        ["J1848+0127_P",null,0.53402,9,null,0.037,null],
        ["J1848+0150",null,3.29015,6.6,null,0.012,null],
        ["J1848+0351",null,0.191442663494,7.4,null,0.066,null],
        ["J1848+0604",null,2.218605206885199,28,1,0.35,null],
        ["J1848+0647",null,0.5059567391,13,2.3,0.17,null],
        ["J1848+0826",null,0.32866472679,18.3,2.8,0.11,null],
        ["J1848+12",null,0.75473,119.6,null,null,null],
        ["J1848+1245_P",null,0.24823,null,null,0.3354,null],
        ["J1848+1516",null,2.233770050625945,153,1.5,null,null],
        ["J1848+26",null,0.629,null,null,null,null],
        ["J1848-0023",null,0.5376246950883786,3.9,null,0.6,null],
        ["J1848-0044_P",null,0.00555,null,null,0.3056,null],
        ["J1848-0055",null,0.2745566847242013,44,null,0.19,null],
        ["J1848-0123","B1845-01",0.6594362931600668,16.8,79,15,null],
        ["J1848-0129A",null,0.019784,null,null,null,null],
        ["J1848-0511",null,1.637129007185206,99,null,0.4,null],
        ["J1848-0601",null,0.2250044754040421,9.7,null,0.24,null],
        ["J1848-1150",null,1.3122184380054083,33,null,0.21,null],
        ["J1848-1243",null,0.4143833544,8.1,null,null,null],
        ["J1848-1414",null,0.29776954730684724,11.7,13,0.6,null],
        ["J1848-1952","B1845-19",4.308189598568733,65,17,null,null],
        ["J1849+0001",null,0.525650459766,10.5,null,0.0163,null],
        ["J1849+0009",null,1.318430596396,null,null,0.0178,null],
        ["J1849+0016_P",null,0.00181,null,null,0.054,null],
        ["J1849+0034_P",null,1.10545,null,null,0.0236,null],
        ["J1849+0037_P",null,0.39649,null,null,0.066,null],
        ["J1849+0106",null,1.83225931855,6,null,0.022,null],
        ["J1849+0127",null,0.5421554813451567,10.7,null,0.46,null],
        ["J1849+0225_P",null,1.47452,4.7,null,0.014,null],
        ["J1849+0304_P",null,0.00179,null,null,0.2836,null],
        ["J1849+0329_P",null,0.0045,null,null,0.0572,null],
        ["J1849+0339_P",null,1.66672,14.7,null,0.055,null],
        ["J1849+0409",null,0.761194081654673,375,null,0.312,null],
        ["J1849+0430",null,0.42112580396,20,null,0.11,null],
        ["J1849+0619_P",null,2.011,null,null,0.0062,null],
        ["J1849+0623_P",null,0.01459,null,null,0.4391,null],
        ["J1849+1001",null,0.03518930795491284,null,null,null,null],
        ["J1849+1043_P",null,0.9714,null,null,0.0172,null],
        ["J1849+2423",null,0.27564149867101,7.7,2.3,null,null],
        ["J1849+2559",null,0.5192634055906,6.3,0.5,null,null],
        ["J1849-0001",null,0.038522586319205,null,null,null,null],
        ["J1849-0014",null,0.491754129798,24,null,0.1498,null],
        ["J1849-0019_P",null,0.91137,67.6,null,0.009,null],
        ["J1849-0040",null,0.6724806071706894,103,null,0.2,null],
        ["J1849-0145_P",null,0.67417,null,null,0.038,null],
        ["J1849-0200_P",null,0.32677,null,null,0.4044,null],
        ["J1849-0317",null,0.6684224572537321,24,null,0.7,null],
        ["J1849-0614",null,0.9533841881748211,13,null,0.59,null],
        ["J1849-0636","B1846-06",1.451362103218088,11,26,1.4,null],
        ["J1850+0011_P",null,0.16754,null,null,0.03,null],
        ["J1850+0026",null,1.0818440452741702,13,null,1.5,null],
        ["J1850+0124",null,0.003559763768043265,null,null,0.188,null],
        ["J1850+0242",null,0.004479864047101479,0.97,null,null,null],
        ["J1850+0423",null,0.290716217162,24.7,null,0.199,null],
        ["J1850+0707_P",null,0.03393,null,null,0.009,null],
        ["J1850+0724_P",null,0.46889,null,null,0.0535,null],
        ["J1850+0824_P",null,1.01316,null,null,0.0432,null],
        ["J1850+0845_P",null,0.04831,null,null,0.01,null],
        ["J1850+0956_P",null,0.00324,null,null,0.0292,null],
        ["J1850+1335","B1848+13",0.34558315187250604,5.3,6,0.8,null],
        ["J1850+15",null,1.383965,31,null,null,null],
        ["J1850-0002",null,0.89335541012,null,null,0.0607,null],
        ["J1850-0004_P",null,null,null,null,null,null],
        ["J1850-0006",null,2.191497968,174,null,0.8,null],
        ["J1850-0020",null,1.574737324031,7.5,null,0.0663,null],
        ["J1850-0026",null,0.166633924251,19.7,null,1.77,null],
        ["J1850-0031",null,0.7341848597787617,46,null,0.23,null],
        ["J1850-0050_P",null,0.22152,null,null,0.0938,null],
        ["J1851+00",null,0.022846663,null,null,null,null],
        ["J1851+0037_P",null,2.52373,null,null,0.0063,null],
        ["J1851+0051_P",null,4.027,null,null,0.0027,null],
        ["J1851+0056_P",null,0.2911,null,null,0.013,null],
        ["J1851+0118",null,0.9069768606870133,15,null,0.1,null],
        ["J1851+0233",null,0.344018308374,13.5,null,0.08,null],
        ["J1851+0241",null,4.4913183586,44,null,0.056,null],
        ["J1851+0347_P",null,2.14145,null,null,0.01,null],
        ["J1851+0418","B1848+04",0.28469837616172805,70.8,null,0.66,null],
        ["J1851+0500_P",null,2.32738,null,null,0.0405,null],
        ["J1851+0843_P",null,0.28891,null,null,0.0552,null],
        ["J1851+10",null,0.86786155,13.6,null,0.05,null],
        ["J1851+1021_P",null,0.86786,null,null,0.0525,null],
        ["J1851+1259","B1848+12",1.2053126551233628,11,8,0.75,null],
        ["J1851-0014_P",null,0.16213,null,null,0.0094,null],
        ["J1851-0029",null,0.5187235769552918,13.7,null,0.44,null],
        ["J1851-0053",null,1.4090657647977658,14.9,null,0.8,null],
        ["J1851-0108_P",null,0.08708,null,null,0.3961,null],
        ["J1851-0114",null,0.9531816851831211,21.2,null,0.28,null],
        ["J1851-0241",null,0.43519385186201315,35,null,0.2,null],
        ["J1851-0633",null,1.9203021305175587,9.16,null,0.12,null],
        ["J1852+0008",null,0.46789411307481127,15.4,null,0.31,null],
        ["J1852+0013",null,0.9577509450477341,19.4,null,0.3,null],
        ["J1852+0018",null,0.318762753335,13.6,null,0.0451,null],
        ["J1852+0031","B1849+00",2.180195177536572,331,null,5.1,null],
        ["J1852+0033",null,11.55871346,null,null,null,null],
        ["J1852+0040",null,0.104912611147,null,null,null,null],
        ["J1852+0056_P",null,1.17779,15,null,0.038,null],
        ["J1852+0158_P",null,0.18573,23,null,0.036,null],
        ["J1852+0305",null,1.3261485670028605,39,null,0.8,null],
        ["J1852+0309_P",null,0.00558,null,null,0.09,null],
        ["J1852+0421_P",null,3.16092,null,null,0.0309,null],
        ["J1852+0857_P",null,3.77214,3.7,null,0.022,null],
        ["J1852+1200",null,0.0038656672288145725,null,null,null,null],
        ["J1852-0000",null,1.92066632921,27,null,0.115,null],
        ["J1852-0002_P",null,0.2451,null,null,0.042,null],
        ["J1852-0024",null,0.3554290457076,6.5,null,0.0582,null],
        ["J1852-0033",null,1.369012367933,null,null,0.0227,null],
        ["J1852-0039",null,0.802905417851,null,null,0.0797,null],
        ["J1852-0044_P",null,0.00241,null,null,0.556,null],
        ["J1852-0055_P",null,0.16403,29,null,0.052,null],
        ["J1852-0111_P",null,1.9021,null,null,0.0431,null],
        ["J1852-0118",null,0.45147265162296757,177.9,null,0.35,null],
        ["J1852-0127",null,0.42898009865450004,24,null,0.58,null],
        ["J1852-0635",null,0.5241590399033976,82,null,9.5,null],
        ["J1852-0834_P",null,0.24932,null,null,0.0198,null],
        ["J1852-0947",null,3.0196940896217397,null,null,0.023,null],
        ["J1852-1310",null,0.0043146558486782645,null,null,null,null],
        ["J1852-2610",null,0.3363372012250115,7.9,12,1.4,null],
        ["J1853+0009",null,0.033395062,1.2,null,null,null],
        ["J1853+0011",null,0.3978894589783022,12,null,0.2,null],
        ["J1853+0013",null,0.92859578401,null,null,0.0352,null],
        ["J1853+0023",null,0.576939240923,13.4,null,0.0194,null],
        ["J1853+0029",null,1.87675787185,69,null,0.074,null],
        ["J1853+0056",null,0.2755775995829073,12.1,null,0.21,null],
        ["J1853+0209_P",null,null,null,null,null,null],
        ["J1853+0237_P",null,0.42739,null,null,0.038,null],
        ["J1853+0259",null,0.585552887667,65,null,0.22,null],
        ["J1853+0312_P",null,0.43809,4.9,null,0.012,null],
        ["J1853+0353_P",null,null,null,null,null,null],
        ["J1853+0427",null,1.32065850582,8,null,0.1,null],
        ["J1853+0505",null,0.905137354251592,119,null,1.1,null],
        ["J1853+0545",null,0.12640033324309044,10.6,null,2.7,null],
        ["J1853+0853",null,3.914657915728037,44,null,0.11,null],
        ["J1853+1303",null,0.004091797383582127,0.6,5.1,0.5,null],
        ["J1853-0003_P",null,0.17152,null,null,0.007,null],
        ["J1853-0004",null,0.1014374536760891,2.2,null,0.7,null],
        ["J1853-0008A_P",null,0.00282485,null,null,null,null],
        ["J1853-0008_P",null,0.00282,null,null,0.014,null],
        ["J1853-0009_P",null,0.7211,null,null,0.0127,null],
        ["J1853-0014_P",null,0.56327,null,null,0.0039,null],
        ["J1853-0049_P",null,0.01678,null,null,0.0543,null],
        ["J1853-0054_P",null,0.30834,null,null,0.0788,null],
        ["J1853-0130_P",null,1.945,null,null,0.0064,null],
        ["J1853-0649",null,1.04813210509,16,null,null,null],
        ["J1853-0842A",null,0.00214943300328329,0.155,null,0.016,null],
        ["J1854+0012_P",null,0.00271,null,null,0.012,null],
        ["J1854+0050",null,0.76727953408,16,null,0.048,null],
        ["J1854+0131_P",null,2.04385,null,null,0.313,null],
        ["J1854+0306",null,4.5578200962,23,null,null,null],
        ["J1854+0317",null,1.3664496471,29,null,0.12,null],
        ["J1854+0319",null,0.628540823296,13.3,null,0.17,null],
        ["J1854+0358_P",null,0.59084,null,null,0.0187,null],
        ["J1854+0704_P",null,0.4509,14,null,0.035,null],
        ["J1854+0934_P",null,0.20717,null,null,0.0064,null],
        ["J1854+0956_P",null,0.08901,null,null,0.0181,null],
        ["J1854+0957_P",null,0.68764,null,null,0.0206,null],
        ["J1854+1002_P",null,0.07101,null,null,0.0265,null],
        ["J1854+1046B_P",null,0.511,null,null,0.0099,null],
        ["J1854+1050","B1852+10",0.5731969890775048,48.1,11,1.03,null],
        ["J1854+36",null,1.30022,36.8,null,null,null],
        ["J1854+40",null,1.748,null,null,null,null],
        ["J1854-0033_P",null,0.36147,14,null,0.018,null],
        ["J1854-0036",null,0.7168558179947386,18,null,0.057,null],
        ["J1854-0156_P",null,0.60079,null,null,0.0481,null],
        ["J1854-01_P",null,0.68059,null,null,null,null],
        ["J1854-0230_P",null,0.6875,null,null,0.7367,null],
        ["J1854-05",null,1.279945,23,null,0.04,null],
        ["J1854-0514",null,1.2799488231504605,null,null,null,null],
        ["J1854-0524",null,0.54402080981,12.6,null,null,null],
        ["J1854-1421","B1851-14",1.1465948471179677,21,8,null,null],
        ["J1854-1557",null,3.4531211813,65,null,null,null],
        ["J1855+0033_P",null,null,null,null,null,null],
        ["J1855+0139_P",null,0.44414,21,null,0.037,null],
        ["J1855+0205",null,0.2468167699732,7.6,null,0.193,null],
        ["J1855+0228_P",null,0.25317,null,null,0.037,null],
        ["J1855+0235",null,0.983029834436,3.2,null,0.0149,null],
        ["J1855+0240_P",null,1.224,null,null,0.0013,null],
        ["J1855+0306",null,1.6335656928,31,null,0.035,null],
        ["J1855+0307",null,0.8453581389340017,14,null,0.97,null],
        ["J1855+0327_P",null,0.78282,null,null,0.014,null],
        ["J1855+0339_P",null,1.76134,null,null,0.012,null],
        ["J1855+0422",null,1.6781063295134198,42.7,null,0.45,null],
        ["J1855+0424_P",null,2.22025,null,null,0.012,null],
        ["J1855+0455_P",null,0.10101,null,null,0.04,null],
        ["J1855+0511_P",null,1.42147,25,null,0.03,null],
        ["J1855+0527",null,1.39348448168,44,null,0.24,null],
        ["J1855+0626",null,0.5288321,10,null,0.13,null],
        ["J1855+0700",null,0.25868464807051533,4.3,null,0.1,null],
        ["J1855-0054_P",null,null,null,null,null,null],
        ["J1855-0115_P",null,2.56229,null,null,0.0549,null],
        ["J1855-0149_P",null,0.00456,null,null,0.0193,null],
        ["J1855-0154_P",null,null,null,null,null,null],
        ["J1855-0211_P",null,null,null,null,null,null],
        ["J1855-0221_P",null,0.00277,null,null,0.3141,null],
        ["J1855-0941",null,0.3454013274128613,23,null,0.9,null],
        ["J1855-1436",null,0.003594091653371,null,null,0.046,null],
        ["J1856+0011_P",null,0.92847,3.2,null,0.009,null],
        ["J1856+0029_P",null,0.376,null,null,0.0026,null],
        ["J1856+0102",null,0.6202171151349284,16.5,null,0.38,null],
        ["J1856+0113","B1853+01",0.26743960987248194,2.9,3.4,0.19,null],
        ["J1856+0211",null,9.89009157558,1.1,null,0.0324,null],
        ["J1856+0243_P",null,0.5466,7.9,null,0.115,null],
        ["J1856+0245",null,0.08090668906,18.3,null,0.58,null],
        ["J1856+0404",null,0.4202521551804407,16.9,null,0.48,null],
        ["J1856+0528_P",null,null,null,null,null,null],
        ["J1856+0615_P",null,0.32697,7.4,null,0.039,null],
        ["J1856+0711_P",null,0.61104,null,null,0.0273,null],
        ["J1856+0805_P",null,0.27617,null,null,0.0082,null],
        ["J1856+0912",null,2.1707012972,42,null,0.04,null],
        ["J1856+1000_P",null,0.00487,null,null,1.7088,null],
        ["J1856+1059_P",null,0.31138,null,null,0.0054,null],
        ["J1856-0018_P",null,0.28288,null,null,0.0377,null],
        ["J1856-0039_P",null,0.0234,null,null,0.5232,null],
        ["J1856-0041_P",null,0.51965,null,null,0.0444,null],
        ["J1856-0105_P",null,0.86835,null,null,0.0435,null],
        ["J1856-0134_P",null,0.38187,null,null,0.0325,null],
        ["J1856-0235_P",null,0.53517,null,null,0.0177,null],
        ["J1856-0526",null,0.3704843373416218,30,null,0.4,null],
        ["J1856-3754",null,7.055202873998977,null,null,null,null],
        ["J1857+0057","B1854+00",0.3569290495376389,24.8,5,0.92,null],
        ["J1857+0143",null,0.13976006451543274,17,null,0.74,null],
        ["J1857+0210",null,0.6309830583311418,17,null,0.3,null],
        ["J1857+0212","B1855+02",0.41585730945468397,13.3,null,1.6,null],
        ["J1857+0214",null,0.333917722223,null,null,0.0596,null],
        ["J1857+0224",null,0.875874011838,14.9,null,0.0352,null],
        ["J1857+0229_P",null,0.584,null,null,0.00062,null],
        ["J1857+0249_P",null,1.54988,null,null,0.0088,null],
        ["J1857+0300",null,0.77267804332,16,null,0.05,null],
        ["J1857+0310_P",null,0.16312,null,null,0.031,null],
        ["J1857+0526",null,0.349951177522,9.8,null,0.66,null],
        ["J1857+0642_P",null,0.0035309897695529158,0.41,null,1.0094,null],
        ["J1857+07",null,0.02912,null,null,null,null],
        ["J1857+0809",null,0.5029238705164849,13.9,null,0.14,null],
        ["J1857+0943","B1855+09",0.005362100549682627,0.5,20,5,null],
        ["J1857-0026_P",null,0.02235,null,null,0.1954,null],
        ["J1857-0110_P",null,0.49673,null,null,0.0079,null],
        ["J1857-0117_P",null,1.22259,null,null,0.0128,null],
        ["J1857-0125_P",null,0.00183,null,null,0.3302,null],
        ["J1857-0230_P",null,0.03515,null,null,0.4945,null],
        ["J1857-1027",null,3.6872190477,117,null,2.032,null],
        ["J1858+0026_P",null,4.71467,null,null,0.042,null],
        ["J1858+0215",null,0.7458280319789807,35,null,0.22,null],
        ["J1858+0239",null,0.197644188243,11.3,null,0.14,null],
        ["J1858+0241",null,4.6932329333315375,78,null,0.1,null],
        ["J1858+0244_P",null,0.00261,null,null,0.073,null],
        ["J1858+0310_P",null,0.37275,124,null,0.119,null],
        ["J1858+0319",null,0.86744387855,10.1,null,0.06,null],
        ["J1858+0346",null,0.25684379795,40,null,0.19,null],
        ["J1858+0453_P",null,3.761,null,null,0.00092,null],
        ["J1858+0609_P",null,0.48435,null,null,0.014,null],
        ["J1858+0724_P",null,0.0077,null,null,0.0712,null],
        ["J1858-0024_P",null,0.4006,32,null,0.026,null],
        ["J1858-0055_P",null,2.84662,null,null,0.0165,null],
        ["J1858-0113_P",null,1.532,null,null,0.0078,null],
        ["J1858-0128_P",null,0.00788,null,null,0.8224,null],
        ["J1858-02_P",null,1.46204,null,null,null,null],
        ["J1858-0736",null,0.551058591,null,null,0.3,null],
        ["J1858-2216",null,0.002384012901237,null,null,0.057,null],
        ["J1858-5422",null,0.0023554963298214886,null,null,null,null],
        ["J1859+00",null,0.5596363,54,null,4.8,null],
        ["J1859+0026A_P",null,0.00857234,null,null,null,null],
        ["J1859+0026B_P",null,0.00233,null,null,0.0303,null],
        ["J1859+0026_P",null,0.00857,null,null,0.029,null],
        ["J1859+0126_P",null,0.9577,13.4,null,0.036,null],
        ["J1859+0239B_P",null,0.849,null,null,0.0092,null],
        ["J1859+0239_P",null,0.05611,null,null,0.01,null],
        ["J1859+0251_P",null,3.58,null,null,0.0032,null],
        ["J1859+0313_P",null,0.00161,null,null,0.06,null],
        ["J1859+0345",null,1.51150850359,31,null,0.09,null],
        ["J1859+0430",null,0.33632493022,19,null,0.0185,null],
        ["J1859+0434_P",null,0.45834,12.5,null,0.015,null],
        ["J1859+0601",null,1.0443127017854041,30,null,0.3,null],
        ["J1859+0603",null,0.508561079708,13.8,null,0.16,null],
        ["J1859+0658_P",null,0.00511,null,null,0.036,null],
        ["J1859+07",null,null,4.5,null,null,null],
        ["J1859+0832_P",null,null,null,null,null,null],
        ["J1859+1526",null,0.933971582308,7.8,1.5,null,null],
        ["J1859+7654",null,1.393729135204375,33,null,null,null],
        ["J1859-0152_P",null,0.903,null,null,0.0172,null],
        ["J1859-0224_P",null,0.00617,null,null,0.124,null],
        ["J1859-0233_P",null,null,null,null,null,null],
        ["J1900+0213_P",null,0.03209,null,null,0.025,null],
        ["J1900+0227",null,0.37426157515586045,15.2,null,0.33,null],
        ["J1900+0308",null,0.00490923901641845,null,null,0.14,null],
        ["J1900+0405_P",null,0.07238,33,null,0.033,null],
        ["J1900+0438",null,0.312314406456,26,null,0.12,null],
        ["J1900+0634",null,0.3898721267340766,6.5,null,0.24,null],
        ["J1900+0715_P",null,0.97044,15.7,null,0.06,null],
        ["J1900+0732_P",null,1.709,null,null,0.004,null],
        ["J1900+0908_P",null,null,null,null,null,null],
        ["J1900+0947_P",null,0.00241,null,null,0.0724,null],
        ["J1900+1017_P",null,0.3715,null,null,0.027,null],
        ["J1900+30",null,0.602227,12.1,null,null,null],
        ["J1900+4221",null,4.341134270625105,null,null,0.025,null],
        ["J1900+5106",null,0.337759159,null,null,null,null],
        ["J1900-0051",null,0.385194193016695,4.9,null,0.45,null],
        ["J1900-0126_P",null,0.004,null,null,0.077,null],
        ["J1900-0134",null,1.83233207264119,46,null,0.202,null],
        ["J1900-0152_P",null,1.384,null,null,0.0145,null],
        ["J1900-0933",null,1.42388919185353,38,null,0.4,null],
        ["J1900-2600","B1857-26",0.6122092044382964,53,131,15,null],
        ["J1900-7951","B1851-79",1.2791931935,30,6.5,0.946,null],
        ["J1901+00",null,0.777662,20.9,null,0.35,null],
        ["J1901+0020_P",null,0.21481,9.3,null,0.042,null],
        ["J1901+0124",null,0.31881916458376847,7.4,null,0.3,null],
        ["J1901+0156","B1859+01",0.2882209076125677,4.1,13.7,0.38,null],
        ["J1901+0234",null,0.88524028123,16.2,null,0.14,null],
        ["J1901+0254",null,1.2996934494707475,66,null,0.58,null],
        ["J1901+0300",null,0.007796776259722284,null,null,0.135,null],
        ["J1901+0315_P",null,0.81982,null,null,0.027,null],
        ["J1901+0320",null,0.6365844782166424,55,null,0.89,null],
        ["J1901+0331","B1859+03",0.6554562898489917,8.7,165,4.2,null],
        ["J1901+0355",null,0.5547564648285169,11.8,null,0.15,null],
        ["J1901+0413",null,2.663079683044812,95,null,1.2,null],
        ["J1901+0435",null,0.6905763580787282,315,null,4.244,null],
        ["J1901+0459",null,0.87704381015,51,null,0.12,null],
        ["J1901+0510",null,0.6147566940826142,65,null,0.66,null],
        ["J1901+0511",null,4.6003689902,13,null,0.05,null],
        ["J1901+0621",null,0.8320019489218338,67,null,0.47,null],
        ["J1901+0658",null,0.07574385040529537,2,null,0.052,null],
        ["J1901+0712_P",null,1.03771,null,null,0.043,null],
        ["J1901+0716","B1859+07",0.6440005421843733,14.3,3.9,0.9,null],
        ["J1901+1140_P",null,0.34071,null,null,0.0301,null],
        ["J1901+13",null,0.74095209,26,null,0.07,null],
        ["J1901+1306",null,1.830857453,48,0.6,null,null],
        ["J1901+1316_P",null,0.74096,null,null,0.0208,null],
        ["J1901-0015_P",null,0.51707,null,null,0.0199,null],
        ["J1901-0104_P",null,0.73951,null,null,0.0449,null],
        ["J1901-0125",null,0.0027933649560078376,null,null,null,null],
        ["J1901-0312",null,0.35572653714483016,5.6,null,0.23,null],
        ["J1901-0315",null,0.8016930968827072,10,null,0.09,null],
        ["J1901-0906",null,1.781928996780741,45,11,3.5,null],
        ["J1901-1740",null,1.95685759005,59.3,null,0.3,null],
        ["J1902+0011_P",null,0.00593,null,null,0.1354,null],
        ["J1902+0235",null,0.415394227732,9,null,0.04,null],
        ["J1902+0248",null,1.2237774535891253,10,null,0.17,null],
        ["J1902+0556","B1900+05",0.7465773564335665,11,15,1.2,null],
        ["J1902+0557_P",null,null,null,null,null,null],
        ["J1902+0615","B1900+06",0.6735066579164285,3.9,22,1.6,null],
        ["J1902+0717_P",null,0.35605,null,null,0.0138,null],
        ["J1902+0723",null,0.4878126283,14.6,0.6,0.17,null],
        ["J1902+0809_P",null,0.19023,3.7,null,0.01,null],
        ["J1902+0909_P",null,0.6891,null,null,0.0515,null],
        ["J1902+0926_P",null,0.60543,null,null,0.0127,null],
        ["J1902+0938_P",null,0.0454,null,null,0.0072,null],
        ["J1902+0953_P",null,0.67733,null,null,0.0085,null],
        ["J1902+1022_P",null,0.50191,null,null,0.0285,null],
        ["J1902+1141",null,0.40914018296,12,null,0.12,null],
        ["J1902+1234_P",null,0.47417,null,null,0.0289,null],
        ["J1902-0012_P",null,14.3089,null,null,0.0084,null],
        ["J1902-0107_P",null,0.00613,null,null,0.1043,null],
        ["J1902-0340",null,1.5246721059905737,25,null,0.22,null],
        ["J1902-1036",null,0.786813538431,11,null,0.13,null],
        ["J1902-5105",null,0.001742399949905645,null,null,1.01,null],
        ["J1903+0135","B1900+01",0.7293075873316457,7.5,58,5.5,null],
        ["J1903+0317_P",null,0.52116,null,null,0.0138,null],
        ["J1903+0319_P",null,1.854,null,null,0.0051,null],
        ["J1903+0327",null,0.0021499123643492113,0.3,null,0.6,0.62],
        ["J1903+0415",null,1.15139859175,30,null,0.072,null],
        ["J1903+0433_P",null,14.0499,148,null,0.014,null],
        ["J1903+0534_P",null,0.35765,null,null,0.041,null],
        ["J1903+0601",null,0.3741290780476361,8.4,null,0.26,null],
        ["J1903+0654",null,0.79123225301,56.2,null,0.11,null],
        ["J1903+0829_P",null,0.00409,null,null,0.0861,null],
        ["J1903+0830_P",null,0.00408534,null,null,null,null],
        ["J1903+0839_P",null,0.004621169131203006,0.53,null,0.181,null],
        ["J1903+0845",null,0.1531502678628,null,null,0.0304,null],
        ["J1903+0851",null,1.23188198312,6.5,null,0.0529,null],
        ["J1903+0912",null,0.166314477824,5.8,null,0.09,null],
        ["J1903+0925",null,0.3571548202604058,38.4,null,0.2,null],
        ["J1903+0949_P",null,0.32544,null,null,0.0228,null],
        ["J1903+1728_P",null,1.71655,null,null,0.0509,null],
        ["J1903+2225",null,0.65118538418,11.8,0.8,null,null],
        ["J1903-0258",null,0.3014587740785948,5.6,null,0.14,null],
        ["J1903-0632","B1900-06",0.4318893087444903,7.2,23,null,null],
        ["J1903-0848",null,0.88732464056,14,null,null,null],
        ["J1903-7051",null,0.003597898018891121,null,null,0.96,null],
        ["J1904+0004",null,0.13952471783259934,7.1,16,2.9,null],
        ["J1904+0050_P",null,0.49618,null,null,0.055,null],
        ["J1904+0056",null,0.43808945697,21,null,0.045,null],
        ["J1904+0056_P",null,0.00585,null,null,0.3608,null],
        ["J1904+0100_P",null,1.30879,null,null,0.0036,null],
        ["J1904+0207_P",null,0.00504,null,null,0.018,null],
        ["J1904+0358_P",null,0.75154,4.1,null,0.014,null],
        ["J1904+0412",null,0.0710948973807,1.7,null,0.23,null],
        ["J1904+0415_P",null,0.23145,26.9,null,0.053,null],
        ["J1904+0451",null,0.006092367929629891,null,null,0.093,null],
        ["J1904+0519_P",null,1.68053,14.1,null,0.077,null],
        ["J1904+0535_P",null,0.60376,null,null,0.045,null],
        ["J1904+0553B_P",null,0.57454,null,null,0.0049,null],
        ["J1904+0553_P",null,0.004907323702051498,0.56,null,0.826,null],
        ["J1904+0603_P",null,1.97493,null,null,0.024,null],
        ["J1904+0621_P",null,1.232,null,null,0.0018,null],
        ["J1904+0738",null,0.20895850006149652,3,null,0.23,null],
        ["J1904+0800",null,0.26335592585200435,7.4,null,0.36,null],
        ["J1904+0823_P",null,1.50773,1.1,null,0.022,null],
        ["J1904+0836_P",null,0.00444,null,null,0.017,null],
        ["J1904+0852",null,0.0061974296377438,null,null,0.0568,null],
        ["J1904+0945_P",null,1.56779,null,null,0.0214,null],
        ["J1904+1011","B1901+10",1.8565699318203086,142,4.4,0.58,null],
        ["J1904+33",null,0.417,15,null,null,null],
        ["J1904-0036_P",null,0.39713,null,null,0.0323,null],
        ["J1904-0150",null,0.37938716196652666,4.5,null,0.09,null],
        ["J1904-11",null,0.00262,null,null,null,null],
        ["J1904-1224",null,0.7508086704675525,9.5,6,0.3,null],
        ["J1904-1629",null,1.54141204423,12.4,null,0.17,null],
        ["J1905+0154A",null,0.00319294082,0.51,null,0.023,null],
        ["J1905+0156_P",null,1.085,null,null,0.0016,null],
        ["J1905+0400",null,0.0037844047882355774,0.5,null,0.05,null],
        ["J1905+0414",null,null,3.3,null,null,null],
        ["J1905+0450_P",null,0.7833,null,null,0.008,null],
        ["J1905+0558_P",null,0.846,null,null,0.0012,null],
        ["J1905+0600",null,0.4412104443276108,11.3,null,0.42,null],
        ["J1905+0616",null,0.9897968110470422,9.9,0.5,0.51,null],
        ["J1905+0649_P",null,0.027464412446363717,1.5,null,0.1635,null],
        ["J1905+0656",null,2.51176254691,6.6,null,0.0607,null],
        ["J1905+0709","B1903+07",0.6480443321213085,33.8,null,1.9,null],
        ["J1905+0758",null,1.192648616445,7.8,null,0.0352,null],
        ["J1905+0849_P",null,1.03433,null,null,0.0037,null],
        ["J1905+0902",null,0.2182543240059,4.1,null,0.097,null],
        ["J1905+0920_P",null,0.17047,null,null,0.01,null],
        ["J1905+0936",null,1.634497451794,3.1,null,0.0608,null],
        ["J1905+1034",null,1.72681020359,26,null,0.04,null],
        ["J1905+1200_P",null,null,null,null,null,null],
        ["J1905-0046_P",null,0.76012,null,null,0.0298,null],
        ["J1905-0056","B1902-01",0.6431838242222259,3.4,9.8,0.7,null],
        ["J1905-0128_P",null,1.07099,null,null,0.00012,null],
        ["J1906+0055",null,0.0027895524236884,null,null,0.122,null],
        ["J1906+0310_P",null,null,null,null,null,null],
        ["J1906+0335_P",null,1.296,null,null,0.008,null],
        ["J1906+0352_P",null,0.2856,null,null,0.0337,null],
        ["J1906+0414",null,1.0433616286550669,12,null,0.23,null],
        ["J1906+0454",null,0.0020832783349232216,0.2,null,0.043,null],
        ["J1906+0509",null,0.39758968304,23,null,0.07,null],
        ["J1906+0641","B1904+06",0.2672768181290841,17.2,2.8,2.8,null],
        ["J1906+0646_P",null,0.35552,null,null,0.048,null],
        ["J1906+0649",null,1.2865643795569428,38.2,null,0.3,null],
        ["J1906+0722",null,0.11152413649784379,null,null,null,null],
        ["J1906+0724",null,1.5364901376,21,null,0.045,null],
        ["J1906+0746",null,0.1440731553806599,3.2,0.9,0.55,null],
        ["J1906+0757",null,0.05718905678761,null,null,0.0289,null],
        ["J1906+0822_P",null,0.43344,null,null,0.009,null],
        ["J1906+0912",null,0.7753446871389991,17,null,0.32,null],
        ["J1906+1049_P",null,0.41459,null,null,0.0313,null],
        ["J1906+1211_P",null,3.80499,null,null,0.0497,null],
        ["J1906+1854",null,1.01909277135,59.2,4.6,null,null],
        ["J1906-0036_P",null,0.12943,null,null,0.0069,null],
        ["J1906-0200_P",null,0.00253,null,null,0.0129,null],
        ["J1906-1754",null,0.00287634963122136,null,null,null,null],
        ["J1907+0009_P",null,0.00237,null,null,0.0154,null],
        ["J1907+0014_P",null,0.02453,null,null,0.4608,null],
        ["J1907+0029_P",null,0.06364,null,null,0.4823,null],
        ["J1907+0052_P",null,0.00292,null,null,0.1123,null],
        ["J1907+0249",null,0.35187943982210884,18.8,null,0.46,null],
        ["J1907+0255",null,0.61876063644,29,null,0.14,null],
        ["J1907+0345",null,0.24015326320797312,1.7,null,0.17,null],
        ["J1907+0534",null,1.1384027131616523,15.5,null,0.36,null],
        ["J1907+0555_P",null,3.159,null,null,0.0072,null],
        ["J1907+0602",null,0.10663274626573079,null,null,0.0034,null],
        ["J1907+0631",null,0.32364802449,22,null,0.25,null],
        ["J1907+0658_P",null,0.21834,null,null,0.054,null],
        ["J1907+0709_P",null,0.3441,6.4,null,0.084,null],
        ["J1907+0731",null,0.36368629610257375,11,null,0.35,null],
        ["J1907+0740",null,0.5746984232594555,13.4,null,0.41,null],
        ["J1907+0833",null,0.167627579462,15,null,0.1,null],
        ["J1907+0859",null,1.52704227084,36,null,0.07,null],
        ["J1907+0918",null,0.2261071099878,2.3,0.4,0.2,null],
        ["J1907+0919",null,5.198346,null,null,null,null],
        ["J1907+1149",null,1.4201603414272963,13.8,null,0.156,null],
        ["J1907+1247","B1904+12",0.82709737059,16.3,0.8,null,null],
        ["J1907+4002","B1905+39",1.2357574527805222,58.5,23,1.8,null],
        ["J1907+57",null,0.424,8,null,null,null],
        ["J1907-0119_P",null,0.05899,null,null,0.0209,null],
        ["J1907-1018",null,1.7657758245830901,null,null,null,null],
        ["J1907-1532",null,0.63223532885,6.8,null,null,null],
        ["J1908+0002_P",null,1.3,null,null,0.0103,null],
        ["J1908+0029_P",null,0.00342,null,null,0.0399,null],
        ["J1908+0053_P",null,0.5529,null,null,0.0181,null],
        ["J1908+0128",null,0.004702324276868943,0.4,null,0.143,null],
        ["J1908+0136_P",null,1.10413,null,null,0.0206,null],
        ["J1908+0233_P",null,0.96916,null,null,0.0259,null],
        ["J1908+0457",null,0.8467928462,22.6,null,0.93,null],
        ["J1908+0457_P",null,0.97647,null,null,0.03,null],
        ["J1908+0500",null,0.29102291947857534,2.3,6.1,0.79,null],
        ["J1908+0558",null,0.168677558616,6,null,0.05,null],
        ["J1908+0704_P",null,0.00199,null,null,0.4098,null],
        ["J1908+0705_P",null,0.00199057,null,null,null,null],
        ["J1908+0734",null,0.21235261338756503,3.1,3.5,0.54,null],
        ["J1908+0811_P",null,0.18164,18,null,0.019,null],
        ["J1908+0833",null,0.512110722994,14.6,null,0.2,null],
        ["J1908+0839",null,0.18539724391922635,6.6,null,0.49,null],
        ["J1908+0909",null,0.3365783562299267,6.2,null,0.22,null],
        ["J1908+0911_P",null,5.166,null,null,0.0014,null],
        ["J1908+0916","B1906+09",0.830270018646574,24,5,0.23,null],
        ["J1908+0949_P",null,0.00905,null,null,0.019,null],
        ["J1908+1035_P",null,0.01069,null,null,0.012,null],
        ["J1908+1036",null,0.01069019541451004,0.16,null,null,null],
        ["J1908+1351",null,3.174831829,15,null,0.022,null],
        ["J1908+2105",null,0.002564392670634839,null,null,null,null],
        ["J1908+2351",null,0.377578026,8.7,0.9,null,null],
        ["J1908-0022_P",null,0.47251,null,null,0.0277,null],
        ["J1909+0007","B1907+00",1.0169534612426392,5.6,12,0.87,null],
        ["J1909+0122_P",null,1.2573806550587314,null,null,52,null],
        ["J1909+0137_P",null,1.88142,null,null,0.0101,null],
        ["J1909+0157_P",null,0.50258,null,null,0.0209,null],
        ["J1909+0254","B1907+02",0.9898358389552339,7.7,21,0.63,null],
        ["J1909+0310_P",null,1.97205,null,null,0.0551,null],
        ["J1909+0423_P",null,0.51158,null,null,0.0336,null],
        ["J1909+0616",null,0.7559927608522158,35.2,null,0.33,null],
        ["J1909+0641",null,0.741761952452,7.6,null,0.112,null],
        ["J1909+0651_P",null,0.57807,null,null,0.0166,null],
        ["J1909+0657_P",null,1.24589,3.2,null,0.087,null],
        ["J1909+0749",null,0.23716129322,126,null,0.226,null],
        ["J1909+0905_P",null,1.49488,null,null,0.012,null],
        ["J1909+0912",null,0.22297210572479073,12.6,null,0.4,null],
        ["J1909+0930_P",null,2.02078,null,null,0.016,null],
        ["J1909+1102","B1907+10",0.2836425225413114,5.5,50,3.2,null],
        ["J1909+1132_P",null,0.0068,null,null,0.015,null],
        ["J1909+1148",null,0.448945466859,4.5,null,0.09,null],
        ["J1909+1205",null,1.229312421,39,null,0.1,null],
        ["J1909+1338_P",null,3.86482,null,null,0.0144,null],
        ["J1909+1450",null,0.9961077952,27,1.1,null,null],
        ["J1909+1859",null,0.54245109601,13.5,5.4,null,null],
        ["J1909-3744",null,0.002947108070536101,null,null,1.8,null],
        ["J1910+0130_P",null,0.00564,null,null,0.0715,null],
        ["J1910+0225",null,0.3378550035689239,17,null,0.6,null],
        ["J1910+0358","B1907+03",2.3302664484907805,52,21,1.5,null],
        ["J1910+0423_P",null,0.09324,null,null,0.6551,null],
        ["J1910+0435",null,0.664679416494,15,null,0.09,null],
        ["J1910+0517",null,0.30804812569960294,13,null,0.5,null],
        ["J1910+0534",null,0.45286735392734545,24.5,null,0.41,null],
        ["J1910+0710",null,0.53864678794,16,null,0.032,null],
        ["J1910+0714",null,2.712428344053059,18.8,5.4,0.36,null],
        ["J1910+0728",null,0.32542050369662345,14.2,null,0.87,null],
        ["J1910+1017",null,0.411158865683,11,null,0.037,null],
        ["J1910+1026",null,0.53149303397,12,null,0.058,null],
        ["J1910+1054_P",null,0.00387,null,null,0.015,null],
        ["J1910+1117_P",null,1.32152,2.3,null,0.018,null],
        ["J1910+1231","B1907+12",1.4417491962385582,14,5,0.28,null],
        ["J1910+1256",null,0.004983583942570281,0.2,null,0.66,0.34],
        ["J1910+5655",null,0.3418589320384898,51,null,null,null],
        ["J1910-0018_P",null,2.06356,null,null,0.0026,null],
        ["J1910-0112",null,1.3606029279810914,48,null,0.07,null],
        ["J1910-0309","B1907-03",0.5046063960852326,5.9,27,0.55,null],
        ["J1910-0556",null,0.557609247999215,15.2,null,0.26,null],
        ["J1910-5320",null,0.0023323668555057,null,null,null,null],
        ["J1910-5959A",null,0.003266186623347789,0.4,null,0.304,null],
        ["J1910-5959B",null,0.008357798500844,0.6,null,0.05,null],
        ["J1910-5959C",null,0.0052773269323093,1.3,null,0.24,null],
        ["J1910-5959D",null,0.009035285247765,0.7,null,0.05,null],
        ["J1910-5959E",null,0.00457176593975,0.6,null,0.07,null],
        ["J1910-5959F",null,0.008485493936966664,null,null,0.055,null],
        ["J1911+00",null,6.94,5,null,null,null],
        ["J1911+0101A","B1908+00A",0.003618524251059,0.4,null,null,null],
        ["J1911+0101B",null,0.005384325706188,null,null,null,null],
        ["J1911+0305_P",null,0.00586,null,null,0.0115,null],
        ["J1911+0310_P",null,1.333,null,null,0.0077,null],
        ["J1911+0314_P",null,0.53116,null,null,0.0209,null],
        ["J1911+0329_P",null,0.05823,null,null,0.0318,null],
        ["J1911+0751_P",null,0.79691,13.7,null,0.052,null],
        ["J1911+0906_P",null,16.9259,null,null,0.026,null],
        ["J1911+0921",null,0.273706758194,21,null,0.113,null],
        ["J1911+0925",null,0.323857547341,19,null,0.09,null],
        ["J1911+0939_P",null,0.36547,114,null,0.026,null],
        ["J1911+1017_P",null,1.337,null,null,0.00078,null],
        ["J1911+1051",null,0.190872844929,7,null,0.051,null],
        ["J1911+1206_P",null,0.00344,null,null,0.1721,null],
        ["J1911+1252_P",null,0.02724,null,null,0.026,null],
        ["J1911+1253",null,0.027238703810865555,1.94,null,null,null],
        ["J1911+1301",null,1.01046173336,17,null,0.051,null],
        ["J1911+1336",null,0.299992040976,8,null,0.072,null],
        ["J1911+1347",null,0.0046259624712745055,0.3,3,0.9,null],
        ["J1911+1440_P",null,0.58247,null,null,0.0214,null],
        ["J1911+1525_P",null,3.28249,null,null,0.0073,null],
        ["J1911+1758",null,0.46040581878,8.7,1.9,null,null],
        ["J1911-0129_P",null,1.12681,null,null,0.0325,null],
        ["J1911-1114",null,0.003625745633114,0.18,15,1,null],
        ["J1912+0735_P",null,3.68507,null,null,0.0319,null],
        ["J1912+0934_P",null,0.89747,null,null,0.03,null],
        ["J1912+1000_P",null,3.053,null,null,0.0037,null],
        ["J1912+1036","B1910+10",0.409349485862,14,1.6,0.22,null],
        ["J1912+1105_P",null,0.67071,6.8,null,0.018,null],
        ["J1912+1416",null,0.0031662413906748533,0.45,null,null,null],
        ["J1912+1417_P",null,0.00317,null,null,0.04,null],
        ["J1912+2104","B1910+20",2.232969028273125,9.9,6,0.8,null],
        ["J1912+2525",null,0.62197624506,9.4,1.6,null,null],
        ["J1912-0952",null,0.025068048259737862,null,null,0.195,null],
        ["J1913+0153_P",null,0.00323,null,null,0.0276,null],
        ["J1913+0400_P",null,0.39053,null,null,0.00026,null],
        ["J1913+0446",null,1.61612987171,15.7,null,0.48,null],
        ["J1913+0453_P",null,0.00609,null,null,0.0451,null],
        ["J1913+0458_P",null,0.44479,null,null,0.0178,null],
        ["J1913+0523",null,0.661997424287,2,null,0.025,null],
        ["J1913+0618",null,0.005026861231753213,0.47,null,0.06,null],
        ["J1913+0655_P",null,0.75445,null,null,0.0332,null],
        ["J1913+0657",null,1.25718110369,20,null,0.05,null],
        ["J1913+0832",null,0.1344120375943103,6.8,null,0.9,null],
        ["J1913+0837_P",null,2.47046,null,null,0.02,null],
        ["J1913+0904",null,0.1632505367862031,1.2,null,0.4,null],
        ["J1913+0936","B1911+09",1.24196459936,34,0.8,0.14,null],
        ["J1913+1000",null,0.8371582190463105,34.2,null,0.53,null],
        ["J1913+1011",null,0.0359108619640691,1.6,null,0.9,null],
        ["J1913+1037_P",null,0.43421,6.8,null,0.008,null],
        ["J1913+1050",null,0.190067107649,4.9,null,0.06,null],
        ["J1913+1054_P",null,0.45062,19,null,0.024,null],
        ["J1913+1058_P",null,null,null,null,null,null],
        ["J1913+1102",null,0.027285006852514598,null,null,0.02,null],
        ["J1913+11025",null,0.923871917718,31,null,0.14,null],
        ["J1913+1145",null,0.30607216301722384,10.3,null,0.43,null],
        ["J1913+1330",null,0.9233913866506538,2,null,null,null],
        ["J1913+1400","B1911+13",0.5214733817852234,5.2,5.2,1.2,null],
        ["J1913+3732",null,0.8510790064540659,16.2,null,0.38,null],
        ["J1913-0440","B1911-04",0.8259403019510712,8.9,118,6.8,null],
        ["J1914+0219",null,0.4575271458212469,15.1,null,1.6,null],
        ["J1914+0219_P",null,2.01819,null,null,0.00018,null],
        ["J1914+0625",null,0.878889431192,48.3,null,0.06,null],
        ["J1914+0631",null,0.6938112242092771,13.9,null,0.26,null],
        ["J1914+0659",null,0.01851182255144,null,null,0.41,null],
        ["J1914+0805",null,0.455499390131,29,null,0.16,null],
        ["J1914+0838",null,0.440039882669,4.3,null,0.28,null],
        ["J1914+0905_P",null,0.61723,null,null,0.0191,null],
        ["J1914+1029_P",null,2.48499,3,null,0.012,null],
        ["J1914+1053_P",null,null,null,null,null,null],
        ["J1914+1054_P",null,0.13887,null,null,0.033,null],
        ["J1914+1122","B1911+11",0.600998442042342,19.3,1.1,0.55,null],
        ["J1914+1228_P",null,2.27755,2.8,null,0.023,null],
        ["J1914+1428",null,1.15951978505,22,null,0.057,null],
        ["J1914+2636",null,0.4591143100176222,null,null,0.55,null],
        ["J1915+0227",null,0.3173064024785356,6.7,null,0.4,null],
        ["J1915+0353_P",null,0.05164,null,null,0.0045,null],
        ["J1915+0411_P",null,0.724,null,null,0.0243,null],
        ["J1915+0601_P",null,0.00401,null,null,0.0323,null],
        ["J1915+0639",null,0.64414015325,5.7,null,0.041,null],
        ["J1915+0720_P",null,0.00569,null,null,1.4326,null],
        ["J1915+0738",null,1.5427074142695743,7.3,1.9,0.34,null],
        ["J1915+0752",null,2.05831378861,16,1.7,0.21,null],
        ["J1915+0832_P",null,2.71009,1.7,null,0.016,null],
        ["J1915+0838",null,0.34277780434606075,13.2,null,0.29,null],
        ["J1915+1009","B1913+10",0.40455413975250065,4.3,23,2,null],
        ["J1915+1045_P",null,1.546,null,null,0.0033,null],
        ["J1915+1145",null,0.173647195715,4.8,null,0.09,null],
        ["J1915+1150",null,0.10004095461,5.8,null,0.047,null],
        ["J1915+1410",null,0.29749412166955125,13.2,null,0.134,null],
        ["J1915+1606","B1913+16",0.05903000321781323,6.4,4,0.9,null],
        ["J1915+1647","B1913+167",1.6162314951259928,32.8,4.5,null,null],
        ["J1915+1714_P",null,2.00094,null,null,0.0241,null],
        ["J1915-11",null,2.177,null,null,null,null],
        ["J1916+0740",null,0.011219660170414859,2.86,null,null,null],
        ["J1916+0741_P",null,0.01122,null,null,0.03,null],
        ["J1916+0748",null,0.54175211381,129.5,1.14,2.8,null],
        ["J1916+07481",null,0.867880485703,5.6,null,0.0119,null],
        ["J1916+0844",null,0.43999712867969115,8.4,null,0.44,null],
        ["J1916+0852",null,2.18274598952782,41,null,0.13,null],
        ["J1916+0937_P",null,7.368,null,null,0.00013,null],
        ["J1916+0951","B1914+09",0.2702565092635799,9.1,20,1.6,null],
        ["J1916+1023",null,1.6183389208453556,76,null,0.36,null],
        ["J1916+1030","B1913+105",0.6289697661019799,21.8,null,0.22,null],
        ["J1916+10305",null,0.34938,21,null,0.011,null],
        ["J1916+1142A_P",null,null,null,null,null,null],
        ["J1916+1142B_P",null,1.188,null,null,0.001,null],
        ["J1916+1225",null,0.227387488792,1.7,null,0.094,null],
        ["J1916+1244_P",null,0.16315,null,null,0.0118,null],
        ["J1916+1312","B1914+13",0.28184551757161114,6.1,12,1.2,null],
        ["J1916+1428_P",null,1.12331,null,null,0.0243,null],
        ["J1916+3224",null,1.13744972551,5.6,null,null,null],
        ["J1916+38",null,0.514,null,null,null,null],
        ["J1916-2939",null,1.24861696429,35,null,null,null],
        ["J1917+0543_P",null,0.00544,null,null,0.1189,null],
        ["J1917+0615_P",null,0.003967699429320478,0.81,null,1.1619,null],
        ["J1917+0743",null,0.8134532288005,null,null,0.0328,null],
        ["J1917+0834",null,2.129676060260779,54.4,0.44,0.31,null],
        ["J1917+08340",null,2.933,null,null,0.00015,null],
        ["J1917+0923_P",null,0.00471,null,null,0.571,null],
        ["J1917+1046_P",null,0.08773,null,null,0.014,null],
        ["J1917+1121_P",null,0.51031,null,null,0.009,null],
        ["J1917+1259_P",null,0.005637468440357967,0.32,null,0.036,null],
        ["J1917+1353","B1915+13",0.19463697696677304,4.1,43,6.8,null],
        ["J1917+1411_P",null,0.44646,null,null,0.013,null],
        ["J1917+1551_P",null,0.80933,null,null,0.0143,null],
        ["J1917+1556_P",null,0.00292,null,null,0.1802,null],
        ["J1917+17",null,0.4196,null,null,null,null],
        ["J1917+1710_P",null,0.41934,null,null,0.0323,null],
        ["J1917+1737",null,0.33472522676,5.6,null,0.047,null],
        ["J1917+2035_P",null,0.2883,null,null,0.054,null],
        ["J1917+2224","B1915+22",0.4258972542250378,19.2,3,0.36,null],
        ["J1917+2441_P",null,0.0044,null,null,null,null],
        ["J1918+0342_P",null,null,null,null,null,null],
        ["J1918+0523_P",null,3.6572,null,null,0.0134,null],
        ["J1918+0621_P",null,0.0021036826290528193,0.08,null,1.2535,null],
        ["J1918+1311",null,0.856748867762,7,null,0.054,null],
        ["J1918+1340_P",null,0.23299,20,null,0.044,null],
        ["J1918+1444","B1916+14",1.18120133058681,6.2,1.6,1,null],
        ["J1918+1514_P",null,null,null,null,null,null],
        ["J1918+1521_P",null,0.00407,null,null,0.031,null],
        ["J1918+1536_P",null,0.10995,null,null,0.01,null],
        ["J1918+1540_P",null,0.00428,null,null,0.016,null],
        ["J1918+1541",null,0.37088299877,4.9,0.8,null,null],
        ["J1918+1546",null,0.00376417,null,null,null,null],
        ["J1918+1547_P",null,0.00376,null,null,0.017,null],
        ["J1918+26",null,0.723,null,null,null,null],
        ["J1918-0642",null,0.007645872769642047,0.66,5.9,0.58,null],
        ["J1918-1052",null,0.798692542358,13,null,null,null],
        ["J1919+0021","B1917+00",1.272267006271228,6.4,16,0.8,null],
        ["J1919+0126_P",null,0.0019,null,null,0.1615,null],
        ["J1919+0134",null,1.603983969907814,45.4,null,2.1,null],
        ["J1919+04_P",null,0.00396,null,null,null,null],
        ["J1919+0727_P",null,0.86682,null,null,0.0192,null],
        ["J1919+1113_P",null,0.766,null,null,0.0048,null],
        ["J1919+1314",null,0.571399860595,14.9,null,0.224,null],
        ["J1919+1341_P",null,0.01166,null,null,0.1539,null],
        ["J1919+1502_P",null,0.00365,null,null,0.0625,null],
        ["J1919+1527_P",null,1.37146,null,null,0.007,null],
        ["J1919+1645",null,0.562789986697,8.1,null,0.16,null],
        ["J1919+1745",null,2.081343459724,63.6,null,0.19,null],
        ["J1919+23",null,0.00463,0.2,null,null,null],
        ["J1919+2621",null,0.6515120940705694,7.2,null,0.57,null],
        ["J1920+0129_P",null,0.00358,null,null,0.4499,null],
        ["J1920+0941_P",null,18.2869,null,null,0.0114,null],
        ["J1920+1030_P",null,0.57102,null,null,0.0949,null],
        ["J1920+1040",null,2.215801738886563,44,null,0.57,null],
        ["J1920+1110",null,0.5098858204508795,16,null,0.39,null],
        ["J1920+1340_P",null,1.52571,null,null,0.105,null],
        ["J1920+1515_P",null,1.60276,7.7,null,0.019,null],
        ["J1920+1817_P",null,1.0654,null,null,0.0636,null],
        ["J1920+2650","B1918+26",0.7855218495267271,13.7,6,null,null],
        ["J1920-0950",null,1.037824001161,46,null,0.2,null],
        ["J1921+0137",null,0.00249637181443,1.3,null,0.097,null],
        ["J1921+0812",null,0.21065049267808872,1.5,null,0.66,null],
        ["J1921+0851_P",null,0.957,null,null,0.0729,null],
        ["J1921+0921",null,0.562302288458,10,null,0.058,null],
        ["J1921+1006_P",null,3.345,null,null,0.0027,null],
        ["J1921+1216_P",null,0.003,null,null,0.6001,null],
        ["J1921+1227_P",null,1.598,null,null,0.00027,null],
        ["J1921+1238_P",null,2.13395,null,null,0.0224,null],
        ["J1921+1259_P",null,0.57316,null,null,0.015,null],
        ["J1921+1329_P",null,0.40842,null,null,0.0118,null],
        ["J1921+1340_P",null,4.60294,null,null,0.031,null],
        ["J1921+1419","B1919+14",0.6181877554997562,22.3,3.2,0.68,null],
        ["J1921+1503_P",null,5.63771,null,null,0.0117,null],
        ["J1921+1505_P",null,0.6119,7.6,null,0.015,null],
        ["J1921+1544",null,0.1435756814094,6.3,null,0.211,null],
        ["J1921+1629_P",null,1.8601,null,null,0.0026,null],
        ["J1921+1630",null,0.93644800775,12,null,0.048,null],
        ["J1921+1632_P",null,0.493,null,null,0.00026,null],
        ["J1921+1652_P",null,0.00368,null,null,0.7441,null],
        ["J1921+1720_P",null,0.21987,null,null,0.0337,null],
        ["J1921+1733_P",null,2.00974,null,null,0.0204,null],
        ["J1921+1808_P",null,0.00566,null,null,0.0309,null],
        ["J1921+1929",null,0.0026463414494692257,0.1,null,0.198,null],
        ["J1921+1948","B1918+19",0.8210359182427072,52.8,34,1.7,null],
        ["J1921+2003","B1919+20",0.76068138902,4.9,2.3,null,null],
        ["J1921+2153","B1919+21",1.3373021601894548,33.8,57,19,null],
        ["J1921+34",null,1.4513,7.8,null,null,null],
        ["J1921-05",null,2.22759,28,null,null,null],
        ["J1921-0510",null,0.7942538795222012,32.6,null,0.4,null],
        ["J1922+1131",null,0.56207429041,23,null,0.13,null],
        ["J1922+1511_P",null,2.35721,null,null,0.7435,null],
        ["J1922+1642_P",null,0.68059,null,null,0.0038,null],
        ["J1922+1730_P",null,0.83301,null,null,0.0312,null],
        ["J1922+1733",null,0.23617759307948819,3.1,null,1.157,null],
        ["J1922+2018","B1920+20",1.1727634020200903,51,3.8,null,null],
        ["J1922+2110","B1920+21",1.0779243429815786,16.2,30,1.4,null],
        ["J1922+37",null,1.92,0.012,null,0.007,null],
        ["J1922+58",null,0.529623,14,3.1,null,null],
        ["J1923+1143_P",null,0.37121,null,null,0.009,null],
        ["J1923+1521_P",null,1.04876,null,null,0.015,null],
        ["J1923+1706","B1921+17",0.5472092397047618,20.4,1.5,0.408,null],
        ["J1923+2022_P",null,0.03799,null,null,0.008,null],
        ["J1923+2515",null,0.003788155520882833,0.4,2.7,0.202,null],
        ["J1923+4243",null,0.5951928585118446,12.6,null,null,null],
        ["J1923-0408",null,1.149269371026972,14.6,null,0.11,null],
        ["J1924+1201_P",null,0.00318,null,null,0.2053,null],
        ["J1924+1342",null,0.005721085953133911,1.11,null,null,null],
        ["J1924+1343_P",null,0.00572,null,null,0.032,null],
        ["J1924+1446_P",null,1.09,null,null,0.000063,null],
        ["J1924+1509_P",null,0.23995,5,null,0.014,null],
        ["J1924+1510_P",null,0.49863,4.4,null,0.01,null],
        ["J1924+1628",null,0.375082251011,13.3,null,0.11,null],
        ["J1924+1631",null,2.9351864592,32,null,0.086,null],
        ["J1924+1639",null,0.1580429177826,6.2,null,0.207,null],
        ["J1924+1713",null,0.758433236391,20,null,0.036,null],
        ["J1924+1734_P",null,null,null,null,null,null],
        ["J1924+1835_P",null,0.20098,null,null,0.0124,null],
        ["J1924+1917",null,1.27794162459,32,null,0.039,null],
        ["J1924+1923_P",null,0.68924,5.3,null,0.055,null],
        ["J1924+1932_P",null,0.38886,3.5,null,0.021,null],
        ["J1924+2027_P",null,0.00195,null,null,0.083,null],
        ["J1924+2037_P",null,0.6848,null,null,0.003,null],
        ["J1924+2040","B1922+20",0.237790138,11.3,4,null,null],
        ["J1924+2110_P",null,0.00504,null,null,0.0238,null],
        ["J1925+1335_P",null,0.39864,null,null,0.0217,null],
        ["J1925+1532_P",null,1.6551,null,null,0.021,null],
        ["J1925+1629_P",null,0.00411,null,null,0.088,null],
        ["J1925+1636_P",null,0.04971,null,null,0.011,null],
        ["J1925+1720",null,0.0756589884532,3.1,null,0.07,null],
        ["J1925+19",null,1.916353,null,null,null,null],
        ["J1925+1934_P",null,0.34539,null,null,0.0107,null],
        ["J1925-16",null,3.8858,10,null,null,null],
        ["J1926+0431","B1923+04",1.0740800763472516,13.4,22,null,null],
        ["J1926+0737",null,0.318062050971,151.5,null,0.11,null],
        ["J1926+1434","B1924+14",1.3249221945599483,12,9,0.48,null],
        ["J1926+1452_P",null,0.30451,null,null,0.005,null],
        ["J1926+1614",null,0.308305907254,8,null,0.09,null],
        ["J1926+1631",null,0.6783666636602,12.1,null,0.0786,null],
        ["J1926+1648","B1924+16",0.5798376648896764,8.2,8,1.3,null],
        ["J1926+1803_P",null,1.03465,null,null,0.0151,null],
        ["J1926+1857_P",null,0.27873,12.1,null,0.03,null],
        ["J1926+1928","B1924+19",1.34601218493,32,0.8,null,null],
        ["J1926+2016",null,0.2990717782966,3.3,null,0.122,null],
        ["J1926-0652",null,1.6088163395494997,204,null,1.01,null],
        ["J1926-1314",null,4.86428379983,null,null,null,null],
        ["J1927+0911",null,0.2903052561966228,2.9,null,0.16,null],
        ["J1927+1126_P",null,5.88928,null,null,0.0105,null],
        ["J1927+1430_P",null,0.20288,null,null,0.013,null],
        ["J1927+1457_P",null,0.91963,null,null,0.011,null],
        ["J1927+1849_P",null,0.312,null,null,0.0208,null],
        ["J1927+1852","B1925+18",0.4827663596312356,17.4,3.4,0.441,null],
        ["J1927+1856","B1925+188",0.2983150118864664,27.8,2.2,0.55,null],
        ["J1927+1940_P",null,null,null,null,null,null],
        ["J1927+2008_P",null,0.63496,null,null,0.0213,null],
        ["J1927+2234","B1925+22",1.431066414236,60,6,null,null],
        ["J1928+1245",null,0.0030216063479651454,0.3,null,0.08,null],
        ["J1928+1443",null,1.01073895346,44,null,0.17,null],
        ["J1928+1458_P",null,0.00297,null,null,0.0892,null],
        ["J1928+15",null,0.403,5,null,null,null],
        ["J1928+1725",null,0.28983833,1.1,null,1.4,null],
        ["J1928+1746",null,0.06873567800760332,3.6,null,0.279,null],
        ["J1928+1809_P",null,0.29446,143,null,0.03,null],
        ["J1928+1815",null,0.0105495,null,null,null,null],
        ["J1928+1816_P",null,0.01054,null,null,0.026,null],
        ["J1928+1839_P",null,2.26091,null,null,0.008,null],
        ["J1928+1852",null,0.792806958052,null,null,0.0279,null],
        ["J1928+1902_P",null,0.0058,null,null,0.007,null],
        ["J1928+1915_P",null,0.97435,null,null,0.005,null],
        ["J1928+1923",null,0.817329808312,31,null,0.639,null],
        ["J1928+28",null,1.063,44,null,null,null],
        ["J1928-0108",null,2.3657140252464677,64,null,0.24,null],
        ["J1928-0548",null,0.028040913764965248,null,null,0.246,null],
        ["J1929+00",null,1.1669,19,null,null,null],
        ["J1929+0132",null,0.006418216903731567,0.5,null,0.21,null],
        ["J1929+1259_P",null,0.00285,null,null,0.3075,null],
        ["J1929+1337_P",null,0.20332,null,null,0.0114,null],
        ["J1929+1357",null,0.8669266713902399,11.5,null,2.2,null],
        ["J1929+1504_P",null,0.23278,null,null,0.0112,null],
        ["J1929+1526_P",null,0.39187,null,null,0.0459,null],
        ["J1929+16",null,0.529681,20.6,null,null,null],
        ["J1929+1615_P",null,0.0446,13.3,null,0.012,null],
        ["J1929+1731_P",null,3.9954,5.9,null,0.013,null],
        ["J1929+1844","B1926+18",1.22047000453,21,1.7,null,null],
        ["J1929+19",null,0.3392158,38.4,null,null,null],
        ["J1929+1937_P",null,0.56373,10.5,null,0.017,null],
        ["J1929+1955",null,0.2578332251408513,7.3,null,0.421,null],
        ["J1929+2121",null,0.723598503258,4.4,null,0.23,null],
        ["J1929+2355_P",null,0.00479,null,null,0.3108,null],
        ["J1929+3817",null,0.81421524225,20.4,null,null,null],
        ["J1929+62",null,1.456,24,1.4,null,null],
        ["J1929+6630",null,0.806,14,null,null,null],
        ["J1930+1316","B1927+13",0.76003196831,5.9,5,0.18,null],
        ["J1930+1357",null,0.3235617566079,null,null,0.016,null],
        ["J1930+1403_P",null,0.003209448373530506,0.22,null,0.094,null],
        ["J1930+1408",null,0.425720327769,8,null,0.051,null],
        ["J1930+1708_P",null,0.00228,null,null,0.9395,null],
        ["J1930+1713_P",null,null,null,null,null,null],
        ["J1930+1722",null,1.60970633781,55,null,0.09,null],
        ["J1930+1852",null,0.136855046957,19.2,null,0.06,null],
        ["J1930+2441",null,0.005767406932698191,0.2,null,0.103,null],
        ["J1930+6205",null,1.4561149432526463,null,null,null,null],
        ["J1930-1852",null,0.18552016047926,3.4,null,null,null],
        ["J1931+1428_P",null,0.00261,null,null,0.1577,null],
        ["J1931+1439",null,1.77922557495,65,null,0.08,null],
        ["J1931+1536","B1929+15",0.3143587790436493,7.2,1.2,0.36,null],
        ["J1931+1817",null,0.234131440128,18,null,0.15,null],
        ["J1931+1841_P",null,2.59411,null,null,0.0486,null],
        ["J1931+1952",null,0.501123112694,8.3,null,0.126,null],
        ["J1931+2333_P",null,0.00386,null,null,0.1628,null],
        ["J1931+30",null,0.582126,10,null,null,null],
        ["J1931+4229",null,3.921037513140297,32,null,null,null],
        ["J1931-0144",null,0.5936613597806604,20.1,null,0.196,null],
        ["J1932+1059","B1929+10",0.22651892659397,5.6,303,29,null],
        ["J1932+1500",null,1.8643318674855427,47,null,0.19,null],
        ["J1932+1756",null,0.04183128819907822,1.31,null,0.035,null],
        ["J1932+1916",null,0.20821764926706873,null,null,null,null],
        ["J1932+2020","B1929+20",0.2682174029851208,4.5,29,1.2,null],
        ["J1932+2121_P",null,0.0142447035656371,0.48,null,0.3399,null],
        ["J1932+2126_P",null,null,null,null,null,null],
        ["J1932+2220","B1930+22",0.14446976514442425,1.6,7.8,1.2,null],
        ["J1932-3655",null,0.5714205734484348,6.1,9,0.7,null],
        ["J1933+0758",null,0.437454407217,6.9,0.34,null,null],
        ["J1933+0913_P",null,0.00294,null,null,0.0892,null],
        ["J1933+1304","B1930+13",0.9283239807632802,26.8,2,0.42,null],
        ["J1933+1454_P",null,1.34613,null,null,0.0174,null],
        ["J1933+1726",null,0.02150723378644,null,null,0.04,null],
        ["J1933+1923_P",null,0.37173,null,null,0.016,null],
        ["J1933+2037_P",null,0.79886,null,null,0.0236,null],
        ["J1933+2038_P",null,0.04075,5.4,null,0.023,null],
        ["J1933+2225_P",null,0.30705,null,null,0.0627,null],
        ["J1933+2315_P",null,1.1667,null,null,0.0015,null],
        ["J1933+2401_P",null,null,null,null,null,null],
        ["J1933+2421","B1931+24",0.8136903028332584,25.9,7.5,null,null],
        ["J1933+5335",null,2.05257449,43,null,null,null],
        ["J1933-6211",null,0.0035434314957407988,0.36,null,0.95,null],
        ["J1934+09_P",null,0.00466,null,null,null,null],
        ["J1934+1926",null,0.230984425819,22,null,0.13,null],
        ["J1934+2341_P",null,null,null,null,null,null],
        ["J1934+2352",null,0.17843152366,4.3,null,0.062,null],
        ["J1934+5219",null,0.5684422829737256,25.4,null,null,null],
        ["J1935+1159",null,1.9397581801031183,30,1,0.17,null],
        ["J1935+1616","B1933+16",0.3587451401989297,6.5,242,58,null],
        ["J1935+1726",null,0.004200101791882,0.7,null,0.68,null],
        ["J1935+1745","B1933+17",0.654408146583,7.3,1.3,0.16,null],
        ["J1935+1829",null,0.843547910278,17.6,null,0.037,null],
        ["J1935+1836_P",null,0.3985,null,null,0.0133,null],
        ["J1935+1841_P",null,5.529,null,null,0.00045,null],
        ["J1935+1901_P",null,0.897,null,null,0.0068,null],
        ["J1935+2025",null,0.0801488988546044,1.7,null,0.5,null],
        ["J1935+2154",null,3.2450650753992494,null,null,null,null],
        ["J1935+2200",null,0.912005933,null,null,0.0098,null],
        ["J1936+13",null,0.00434,null,null,null,null],
        ["J1936+1536","B1933+15",0.96733836953,17.7,2,null,null],
        ["J1936+18",null,0.05834513,null,null,null,null],
        ["J1936+1952_P",null,0.00972,null,null,0.029,null],
        ["J1936+2035",null,0.03292768386994967,1.56,null,null,null],
        ["J1936+2036_P",null,0.03292,null,null,0.029,null],
        ["J1936+2042",null,1.390726665137,28,null,0.045,null],
        ["J1936+21",null,0.64296,15.9,null,null,null],
        ["J1936+217",null,0.03158187,null,null,null,null],
        ["J1937+1358_P",null,2.64537,null,null,0.1321,null],
        ["J1937+1505",null,2.8727736505866055,37,null,0.13,null],
        ["J1937+1658",null,0.00395766764533531,0.4,null,0.169,null],
        ["J1937+1912_P",null,0.00509,null,null,0.1092,null],
        ["J1937+1927_P",null,0.00404,null,null,0.0478,null],
        ["J1937+1941_P",null,0.16676,null,null,0.0495,null],
        ["J1937+2544","B1935+25",0.2009802024421819,13.5,6.6,1.4,null],
        ["J1937+2950",null,1.6574287833573396,18.9,null,0.08,null],
        ["J1937+34",null,1.749,null,null,null,null],
        ["J1937-00",null,0.2401,7.9,null,null,null],
        ["J1938+0650",null,1.121561892,12.8,3.2,null,null],
        ["J1938+14",null,2.9025,53,null,null,null],
        ["J1938+1748_P",null,7.106,null,null,0.0018,null],
        ["J1938+2010",null,0.68708185664,25,null,0.103,null],
        ["J1938+2012",null,0.0026341351275486,null,null,0.02,null],
        ["J1938+2213",null,0.1661155731566,2.6,1,0.59,null],
        ["J1938+2248_P",null,0.79392,null,null,0.0117,null],
        ["J1938+2301_P",null,0.65507,null,null,0.1371,null],
        ["J1938+2302_P",null,0.05276175587207226,1.64,null,0.4021,null],
        ["J1938+2659",null,0.883331781241,33.8,null,0.08,null],
        ["J1938+6604",null,0.022258801226037964,0.48,null,null,null],
        ["J1938-0940",null,0.17386658163563892,null,null,0.024,null],
        ["J1939+10",null,2.3114,45.1,1.2,null,null],
        ["J1939+1848_P",null,0.00336,null,null,0.7089,null],
        ["J1939+2134","B1937+21",0.0015578065670414894,null,240,13.9,4.7],
        ["J1939+2352_P",null,2.14534,null,null,0.007,null],
        ["J1939+2425_P",null,0.00578,null,null,0.0319,null],
        ["J1939+2449","B1937+24",0.6453024693886714,23,3,null,null],
        ["J1939+2452_P",null,2.40253,null,null,0.0077,null],
        ["J1939+2609",null,0.466962555351,2.6,null,0.15,null],
        ["J1940+0239",null,1.23224,7,null,null,null],
        ["J1940+14",null,1.279,null,null,null,null],
        ["J1940+1754_P",null,0.00244,null,null,0.0369,null],
        ["J1940+2102_P",null,0.03005,null,null,0.17,null],
        ["J1940+2203_P",null,11.906,null,null,0.0015,null],
        ["J1940+2231_P",null,5.682,null,null,0.0029,null],
        ["J1940+2245",null,0.258911996567,13,null,0.15,null],
        ["J1940+2337",null,0.546824157964,12,null,0.069,null],
        ["J1940+26",null,0.0048135292,null,null,null,null],
        ["J1940-0902",null,0.9784681384412038,18.2,null,0.23,null],
        ["J1940-24",null,0.0982,2,null,null,null],
        ["J1940-2403",null,1.855276,40,null,null,null],
        ["J1941+0121",null,0.217317451828,20,null,null,null],
        ["J1941+1026",null,0.9053938883,9.8,1.8,null,null],
        ["J1941+1341",null,0.5590840992292493,7.1,null,0.17,null],
        ["J1941+2230_P",null,3.55157,null,null,0.0396,null],
        ["J1941+2525",null,2.306152697,46.2,null,0.239,null],
        ["J1941+2541_P",null,1.05475,null,null,0.0771,null],
        ["J1941+4320",null,0.8409064683921292,15.2,null,null,null],
        ["J1941-2602","B1937-26",0.40285790887542816,3.1,13,1.9,null],
        ["J1942+0147",null,1.40504,40,null,null,null],
        ["J1942+1743","B1939+17",0.69626221476,65,2.8,null,null],
        ["J1942+2029_P",null,0.04456,null,null,0.0346,null],
        ["J1942+2604_P",null,2.64191,null,null,0.0023,null],
        ["J1942+3941",null,1.3532909546245304,45.1,null,null,null],
        ["J1942+8106",null,0.20355845286745913,3,null,null,null],
        ["J1942-2019",null,0.27513272356169727,16.9,null,0.54,null],
        ["J1943+0609",null,0.44622660251321994,3,null,0.7,null],
        ["J1943+2115_P",null,1.85903,null,null,0.0135,null],
        ["J1943+2205_P",null,0.00468,null,null,0.0616,null],
        ["J1943+2206",null,0.0046816713029578395,0.26,null,null,null],
        ["J1943+2210",null,0.005084173689952678,null,null,0.04,null],
        ["J1943+2210_P",null,0.01287,null,null,0.5136,null],
        ["J1943+2446_P",null,0.00559,null,null,0.6312,null],
        ["J1943+2608_P",null,0.63562,null,null,0.0274,null],
        ["J1943+2700_P",null,2.47891,null,null,0.0259,null],
        ["J1943+2847_P",null,0.0063,null,null,0.4647,null],
        ["J1943+28_P",null,0.73782,null,null,null,null],
        ["J1943+5815",null,1.270846926790192,null,null,null,null],
        ["J1943-1237","B1940-12",0.9724303960846684,11,12.9,1.2,null],
        ["J1944+0907",null,0.005185201908798642,1.5,21,2.1,null],
        ["J1944+16_P",null,0.00243,null,null,null,null],
        ["J1944+1755","B1942+17",1.9968990135,20,1.9,null,null],
        ["J1944+1934_P",null,3.44532,null,null,0.0128,null],
        ["J1944+2236",null,0.0036179930781106303,null,null,0.11,null],
        ["J1944-10",null,0.409135,null,null,null,null],
        ["J1944-1750","B1941-17",0.8411577743410036,22.9,7.5,0.3,null],
        ["J1945+07",null,1.0739,null,null,null,null],
        ["J1945+1211",null,4.756796379379277,330,null,0.634,null],
        ["J1945+17_P",null,0.60412,null,null,null,null],
        ["J1945+1834","B1943+18",1.06870769134,23,1.2,null,null],
        ["J1945+2011_P",null,0.50307,null,null,0.0188,null],
        ["J1945+2410_P",null,2.37759,null,null,0.0419,null],
        ["J1945+2706_P",null,0.81915,null,null,0.0055,null],
        ["J1945+2716_P",null,2.39803,null,null,0.0192,null],
        ["J1945-0040","B1942-00",1.0456329828199749,54,6,0.8,null],
        ["J1946+0904_P",null,0.025772259978831008,2.2,null,0.6472,null],
        ["J1946+14",null,2.28244,29,null,null,null],
        ["J1946+1805","B1944+17",0.44061847691084693,30.4,40,10,null],
        ["J1946+2052",null,0.016960175323294,null,null,0.062,null],
        ["J1946+2244","B1944+22",1.33444985809,19,3,0.173,null],
        ["J1946+24",null,4.729,4,null,null,null],
        ["J1946+2433_P",null,0.00857,null,null,0.0945,null],
        ["J1946+2535",null,0.51516705131,9.3,null,0.48,null],
        ["J1946+2611",null,0.4350602546,78.2,1.5,0.697,null],
        ["J1946+2757_P",null,0.74303,null,null,0.0929,null],
        ["J1946+3417",null,0.003170139179028867,0.3,null,0.9,0.61],
        ["J1946-09",null,0.0912,5,null,null,null],
        ["J1946-1312",null,0.9837331919310454,12,null,0.3,null],
        ["J1946-2913","B1943-29",0.9594493179932487,10,9.3,0.5,null],
        ["J1946-5403",null,0.00271,null,null,0.35,null],
        ["J1947+0915",null,1.48074382424,27,null,0.2,null],
        ["J1947+10",null,1.110944,30.9,null,null,null],
        ["J1947+1957",null,0.157508542541,6,null,0.08,null],
        ["J1947+2011_P",null,0.008177551924345196,0.21,null,0.01,null],
        ["J1947+2304_P",null,0.0109,null,null,0.1277,null],
        ["J1947-1120",null,0.002240104451,null,null,null,null],
        ["J1947-18",null,0.00260323,null,null,null,null],
        ["J1947-4215",null,1.798069,72,7,null,null],
        ["J1947-43",null,0.18094,null,null,null,null],
        ["J1948+06",null,1.325,null,null,null,null],
        ["J1948+1801_P",null,0.53624,null,null,0.0125,null],
        ["J1948+1808",null,0.394354427486,16,null,0.08,null],
        ["J1948+2314_P",null,1.471,null,null,0.0007,null],
        ["J1948+2333",null,0.5283521633015,5.2,null,0.28,null],
        ["J1948+2428_P",null,1.33395,null,null,0.0083,null],
        ["J1948+2438_P",null,1.903,null,null,0.005,null],
        ["J1948+2551",null,0.1966268136138,9.2,null,0.622,null],
        ["J1948+2819",null,0.932692952758,13,null,0.046,null],
        ["J1948+3540","B1946+35",0.7173111740759792,31.5,145,8.3,null],
        ["J1948-27",null,0.332,6,null,null,null],
        ["J1948-2730",null,0.33163130847985023,null,null,null,null],
        ["J1949+2306",null,1.3193733853,18,null,0.097,null],
        ["J1949+2516_P",null,0.41034,14.4,null,0.005,null],
        ["J1949+2731_P",null,0.84714,null,null,0.015,null],
        ["J1949+3106",null,0.013138183152165393,2.1,null,0.23,null],
        ["J1949+3426",null,0.3885391675859,16.3,null,null,null],
        ["J1949-2524","B1946-25",0.9576198370703672,10,5.2,0.4,null],
        ["J1950+05",null,0.455934,17.4,null,null,null],
        ["J1950+2352_P",null,0.31976,null,null,0.032,null],
        ["J1950+2414",null,0.004304775483256483,0.34,null,0.163,null],
        ["J1950+2556_P",null,2.03864,null,null,0.02,null],
        ["J1950+2728_P",null,1.67043,null,null,0.0383,null],
        ["J1950+3001",null,2.78891789352,63,null,0.24,null],
        ["J1951+1123",null,5.0940830275,26,1.2,null,null],
        ["J1951+2329_P",null,1.8261,null,null,0.0025,null],
        ["J1951+2352_P",null,0.04839,null,null,0.0581,null],
        ["J1951+2528_P",null,0.00231,null,null,0.2868,null],
        ["J1951+2857_P",null,1.62538,null,null,0.0162,null],
        ["J1951+4724",null,0.18192759882171755,48.26,null,null,null],
        ["J1952+1410","B1949+14",0.275025682519723,4.5,6,null,null],
        ["J1952+2513",null,1.07764729476,19,null,0.031,null],
        ["J1952+2630",null,0.020732360091373758,1.3,null,0.085,null],
        ["J1952+2702_P",null,0.00414,null,null,0.014,null],
        ["J1952+2818_P",null,0.00309,null,null,0.0224,null],
        ["J1952+2836_P",null,0.01802,null,null,0.095,null],
        ["J1952+2837",null,0.018020942686838324,1.06,null,null,null],
        ["J1952+3021",null,1.66566523108,41.5,null,0.023,null],
        ["J1952+3252","B1951+32",0.03953119285477742,3.7,7,1,null],
        ["J1953+1006_P",null,0.00259,null,null,0.0915,null],
        ["J1953+1149",null,0.8518902768,19.6,2.2,null,null],
        ["J1953+1844",null,0.004444080924330244,null,null,0.122,null],
        ["J1953+1846A",null,0.004888300745824185,0.5,null,0.059,null],
        ["J1953+1846B",null,0.07989931383354774,null,null,null,null],
        ["J1953+1846C",null,0.02893279811304039,null,null,null,null],
        ["J1953+1846D",null,0.10067901578798051,null,null,null,null],
        ["J1953+1846E",null,0.004444080924333601,null,null,null,null],
        ["J1953+2732",null,1.33396499366,24.8,null,0.105,null],
        ["J1953+2819",null,1.01100245325,14.3,null,0.047,null],
        ["J1953+3014",null,1.271207766231389,32.9,null,null,null],
        ["J1953+3303_P",null,0.71289,null,null,0.0216,null],
        ["J1954+1021",null,2.09944017034,25,null,null,null],
        ["J1954+2407",null,0.1934045707829,1.4,null,0.1,null],
        ["J1954+2529",null,0.931210094606,16,null,0.059,null],
        ["J1954+2732_P",null,0.73775,null,null,0.0198,null],
        ["J1954+2833_P",null,0.02721,null,null,0.1235,null],
        ["J1954+2836",null,0.09270905473725415,null,null,null,null],
        ["J1954+2923","B1952+29",0.4266767865301635,7.9,6.6,8,null],
        ["J1954+3852",null,0.352933478726,2.2,null,null,null],
        ["J1954+4347",null,1.3870414462744765,null,null,null,null],
        ["J1954+4357",null,1.3870411601545107,50,null,null,null],
        ["J1955+2527",null,0.004872765862979332,0.6,null,0.229,null],
        ["J1955+2857_P",null,0.18889,null,null,0.0167,null],
        ["J1955+2908","B1953+29",0.0061331665162340935,0.7,12,0.98,null],
        ["J1955+2912_P",null,0.27951,4.3,null,0.005,null],
        ["J1955+2930",null,1.07387774187,30.9,null,0.072,null],
        ["J1955+3114_P",null,0.00336,null,null,0.0734,null],
        ["J1955+5059","B1953+50",0.5189379874090803,6,26,4,null],
        ["J1955+6708",null,0.008565406267814503,1,null,null,null],
        ["J1955-0907",null,0.484,null,null,null,null],
        ["J1956+07",null,5.01248,125,null,null,null],
        ["J1956+0838",null,0.30391107936355555,13,null,0.8,null],
        ["J1956+2826_P",null,0.07179,14.1,null,0.013,null],
        ["J1956+2911_P",null,3.816,null,null,0.0019,null],
        ["J1956+35_P",null,0.87552,null,null,null,null],
        ["J1956-2752",null,0.2600144,null,null,null,null],
        ["J1957+2516",null,0.003961655342404,null,null,0.02,null],
        ["J1957+2711_P",null,0.02337,null,null,0.1767,null],
        ["J1957+2754_P",null,0.00331,null,null,0.2115,null],
        ["J1957+2831",null,0.30768286519780486,9,null,1,null],
        ["J1957+5033",null,0.374806686187845,null,null,null,null],
        ["J1957-0002",null,0.96509596606,16.1,null,null,null],
        ["J1958+2214",null,1.0503800099033815,null,null,null,null],
        ["J1958+22_P",null,1.05038,null,null,null,null],
        ["J1958+23_P",null,8.07375,null,null,null,null],
        ["J1958+2846",null,0.2903892447504656,null,null,null,null],
        ["J1958+3033",null,1.09858060946,4.9,null,0.032,null],
        ["J1958+3156_P",null,5.56472,null,null,0.008,null],
        ["J1958+5650",null,0.31183237764245947,16,null,null,null],
        ["J1959+2048","B1957+20",0.00160740168480632,1.1,20,0.29,null],
        ["J1959+2758_P",null,0.00515,null,null,0.0535,null],
        ["J1959+3036_P",null,2.88846,null,null,0.0986,null],
        ["J1959+3141_P",null,0.51453,null,null,0.0416,null],
        ["J1959+3620",null,0.406081181,40.5,null,0.4,null],
        ["J2000+04",null,0.777,null,null,null,null],
        ["J2000+22",null,1.0505,null,null,null,null],
        ["J2000+2806_P",null,0.72986,null,null,0.0366,null],
        ["J2000+2920",null,3.07378325868,55.5,null,0.1,null],
        ["J2000+3157_P",null,0.0035,null,null,0.0529,null],
        ["J2000+3207_P",null,0.38844,null,null,0.0243,null],
        ["J2001+0701",null,0.006819958560757103,null,null,0.231,null],
        ["J2001+2856_P",null,1.44555,null,null,0.0201,null],
        ["J2001+4209_P",null,null,null,null,null,null],
        ["J2001+4258",null,0.7191661378516744,9.4,null,null,null],
        ["J2001-0349",null,1.344724016036617,83,null,0.28,null],
        ["J2002+1637",null,0.27649748362,4.1,0.4,null,null],
        ["J2002+30",null,0.421794,28.2,null,null,null],
        ["J2002+3217","B2000+32",0.6967605101537256,4.8,5.5,1.2,null],
        ["J2002+4050","B2000+40",0.9050668203089066,17.5,53,4.9,null],
        ["J2003+2916",null,1.0098766696,25.2,null,0.2,null],
        ["J2003+3032_P",null,0.00179,null,null,0.1027,null],
        ["J2003+3600_P",null,0.47814,null,null,0.0259,null],
        ["J2004+2653",null,0.66587861963,17,null,0.06,null],
        ["J2004+3003_P",null,0.08074,null,null,0.3639,null],
        ["J2004+3137","B2002+31",2.1112647338162023,25.8,14.5,1.8,null],
        ["J2004+3304_P",null,1.19337,null,null,0.0277,null],
        ["J2004+3429",null,0.24095264193,4.5,null,0.11,null],
        ["J2005+14_P",null,2.33214,null,null,null,null],
        ["J2005+3154_P",null,0.74984,null,null,0.00017,null],
        ["J2005+3156_P",null,2.146,null,null,0.001,null],
        ["J2005+3411_P",null,0.65105,19.4,null,0.082,null],
        ["J2005+3547",null,0.615033894871,24.4,null,0.25,null],
        ["J2005+3552",null,0.30794290464,9.3,null,0.21,null],
        ["J2005-0020",null,2.2796800296651574,64.6,8,0.7,null],
        ["J2006+0148",null,0.0021635567935669705,null,null,null,null],
        ["J2006+2205",null,1.7418738811985746,24.7,null,null,null],
        ["J2006+3102",null,0.16369523645,10.8,null,0.27,null],
        ["J2006+4058",null,0.49969491211963746,18.216,null,null,null],
        ["J2006-0807","B2003-08",0.580871337030867,76,20,4.7,null],
        ["J2007+0809",null,0.32572436605,84,null,null,null],
        ["J2007+0910",null,0.4587348258074,6.7,1.51,null,null],
        ["J2007+20",null,4.634,null,null,null,null],
        ["J2007+2722",null,0.024497388545933394,13.6,null,2.32,1.7],
        ["J2007+3120",null,0.60820531457,15.2,null,0.122,null],
        ["J2007+3343_P",null,0.00268,null,null,0.5868,null],
        ["J2008+2513",null,0.58919550332,11.2,2.7,null,null],
        ["J2008+2755_P",null,1.51926,null,null,0.111,null],
        ["J2008+3139",null,0.226118635651,2.1,null,0.043,null],
        ["J2008+3758",null,4.352302967973884,34,null,null,null],
        ["J2009+3122_P",null,0.07654,null,null,0.017,null],
        ["J2009+3326",null,1.43836860189,262.7,null,0.15,null],
        ["J2010+2845",null,0.5653693451984,7.7,null,0.43,null],
        ["J2010+3051",null,0.004816274513308841,0.23,null,0.1,null],
        ["J2010+31",null,1.55154,22.8,null,null,null],
        ["J2010+3230",null,1.4424475206,29.6,null,0.118,null],
        ["J2010-1323",null,0.00522327101686168,0.28,null,0.7,null],
        ["J2011+3006_P",null,2.50566,13.3,null,0.312,null],
        ["J2011+3331",null,0.93173309347,230.2,null,0.384,null],
        ["J2011+3520_P",null,0.94322,null,null,0.3139,null],
        ["J2012-2029",null,0.54400187061,18,null,null,null],
        ["J2013+3058",null,0.276027693446,4.7,null,0.067,null],
        ["J2013+3100_P",null,0.36855,5.3,null,0.027,null],
        ["J2013+3845","B2011+38",0.23019361385947965,15.28,26,6.4,null],
        ["J2013-0649",null,0.580187269001,9.1,null,null,null],
        ["J2014+10",null,1.14,null,null,null,null],
        ["J2014+3326_P",null,0.977,null,null,0.00012,null],
        ["J2015+0756",null,0.00432798395698861,null,null,0.205,null],
        ["J2015+2524",null,2.3032990816,54,0.4,null,null],
        ["J2015+27",null,0.3081,null,null,null,null],
        ["J2015+3404_P",null,0.00428,null,null,0.6402,null],
        ["J2015+3423_P",null,0.78465,null,null,0.017,null],
        ["J2015+3524_P",null,0.45752,null,null,0.0084,null],
        ["J2016+1948",null,0.06494038824151367,1,3.3,null,null],
        ["J2016+3318_P",null,2.17835,null,null,0.0185,null],
        ["J2016+3711",null,0.050808737717638004,null,null,null,null],
        ["J2016+3820",null,0.2309979130170151,9.842,null,null,null],
        ["J2016+4231",null,1.2437594370247285,29,null,null,null],
        ["J2017+0603",null,0.0028962158167229754,0.1,null,0.18,0.32],
        ["J2017+1933_P",null,0.31485,null,null,0.1029,null],
        ["J2017+2043",null,0.537143086032,16.1,1.5,null,null],
        ["J2017+2819",null,1.832558917299,60,null,0.061,null],
        ["J2017+3625",null,0.16674917904176084,null,null,null,null],
        ["J2017+5906",null,0.40347833490243656,20,null,null,null],
        ["J2017-0414",null,0.0406,1.4,null,null,null],
        ["J2017-1614",null,0.0023142872649224,null,null,null,null],
        ["J2017-2737",null,0.2245236192560796,13,null,null,null],
        ["J2018+2839","B2016+28",0.5579534804225343,15.5,314,30,null],
        ["J2018+3418_P",null,2.1916,null,null,0.005,null],
        ["J2018+3431",null,0.3876640866385,19.1,null,0.24,null],
        ["J2018+3518_P",null,0.031316219327956245,1.8,null,0.1525,null],
        ["J2018-0414",null,0.04061220967254471,null,null,null,null],
        ["J2019+2425",null,0.00393452408033124,0.6,null,0.26,null],
        ["J2019+3718_P",null,0.5052,null,null,0.1063,null],
        ["J2019+3810",null,0.5252398770518496,24,null,null,null],
        ["J2019+72",null,0.219,20,null,null,null],
        ["J2021+3651",null,0.10374095207436164,9.9,null,0.1,null],
        ["J2021+3740_P",null,0.54809,null,null,0.0452,null],
        ["J2021+4024_P",null,0.37054,39,null,0.088,null],
        ["J2021+4026",null,0.26531766092995546,3,null,null,null],
        ["J2022+2112",null,0.803551296937408,24,null,null,null],
        ["J2022+2534",null,0.0026459357675862366,0.49,null,null,null],
        ["J2022+2854","B2020+28",0.3434021577859938,10.4,71,38,null],
        ["J2022+3812_P",null,0.29375,null,null,0.0665,null],
        ["J2022+3842",null,0.04857877964,null,null,null,0.06],
        ["J2022+3845_P",null,1.0089,26,null,0.055,null],
        ["J2022+5154","B2021+51",0.5291969178083342,11.9,77,27,null],
        ["J2023+0937",null,1.6047376692547357,null,null,null,null],
        ["J2023+2853_P",null,0.01133,0.4,null,0.161,null],
        ["J2023+5037","B2022+50",0.3726190545356841,3.5,6.5,2.2,null],
        ["J2024+3751_P",null,0.21164,null,null,0.0116,null],
        ["J2024+48",null,1.262,null,null,null,null],
        ["J2025+21_P",null,0.62348,null,null,null,null],
        ["J2026+3656_P",null,1.78552,null,null,0.1767,null],
        ["J2027+0255",null,0.010595519821519026,null,null,0.186,null],
        ["J2027+2146","B2025+21",0.398173021652,8.4,0.7,null,null],
        ["J2027+2837_P",null,0.00479,null,null,0.1091,null],
        ["J2027+4557",null,1.0996513680443851,19.7,14.2,1.34,null],
        ["J2027+7502",null,0.515218649151172,30,2.4,null,null],
        ["J2028+3332",null,0.17670741511380703,null,null,null,null],
        ["J2029+34",null,1.8194,null,null,null,null],
        ["J2029+3434_P",null,1.80882,null,null,0.0292,null],
        ["J2029+3744","B2027+37",1.216804657740282,19.9,18,0.6,null],
        ["J2029+4453_P",null,1.36137,null,null,0.0264,null],
        ["J2029+5459",null,0.5789091759241137,null,null,null,null],
        ["J2030+2228","B2028+22",0.6305126466792664,19.4,5,null,null],
        ["J2030+31_P",null,1.0147,null,null,null,null],
        ["J2030+3641",null,0.20012932816843285,9,null,0.15,0.09],
        ["J2030+3818_P",null,0.13372,null,null,0.017,null],
        ["J2030+3833_P",null,null,null,null,null,null],
        ["J2030+3929_P",null,1.71842,16.9,null,0.035,null],
        ["J2030+3944_P",null,0.30618,62,null,0.218,null],
        ["J2030+4415",null,0.22707017738714103,null,null,null,null],
        ["J2030+55",null,0.579,19,null,null,null],
        ["J2031+34",null,1.819,null,null,null,null],
        ["J2031-1254",null,0.005788357847126126,null,null,null,null],
        ["J2032+0701",null,0.40957644350971517,null,null,0.027,null],
        ["J2032+4055_P",null,0.04874,null,null,0.0737,null],
        ["J2032+4127",null,0.14324646628873475,6.8,null,null,0.12],
        ["J2033+0042",null,5.013400111407841,78,null,null,null],
        ["J2033+1734",null,0.005948957540585641,0.2,3.6,0.277,null],
        ["J2033-1938",null,1.28171902379,11,null,null,null],
        ["J2034+3632",null,0.0036503011498448625,null,null,null,null],
        ["J2035+3538",null,0.4799800328306343,7,null,null,null],
        ["J2035+3655",null,0.02456496756279627,0.684,null,null,null],
        ["J2036+2835",null,1.35872676315,25.9,null,0.15,null],
        ["J2036+3506_P",null,1.37092,null,null,0.0132,null],
        ["J2036+6646",null,0.5019271782,19.5,null,null,null],
        ["J2037+1942","B2034+19",2.0743794511565805,35.5,2,null,null],
        ["J2037+3621","B2035+36",0.6187150841856833,12.6,6,0.8,null],
        ["J2038+3447",null,0.16016485203653624,null,null,null,null],
        ["J2038+35",null,0.16,3.8,null,null,null],
        ["J2038+5319","B2036+53",1.4245682151528811,19.4,3.1,0.3,null],
        ["J2038-3816",null,1.5772897322339043,26,7,0.3,null],
        ["J2039-3616",null,0.0032750415510289024,0.27,null,0.5,null],
        ["J2039-5617",null,0.0026509071060648757,null,null,0.585,null],
        ["J2040+1657",null,0.865606225032,14.9,0.6,null,null],
        ["J2040+20",null,0.2905,null,null,null,null],
        ["J2040-21",null,0.563,22,null,null,null],
        ["J2040-2156",null,0.5625753562013994,null,null,null,null],
        ["J2041+3934_P",null,0.37995,null,null,0.085,null],
        ["J2041+4551",null,1.1598115749146,45.17,null,null,null],
        ["J2041+46_P",null,1.15982,null,null,null,null],
        ["J2042+0246",null,0.0045337267023282,0.1,null,0.059,null],
        ["J2042+4353_P",null,0.01602,null,null,0.0529,null],
        ["J2042+4550_P",null,0.54841,null,null,0.0486,null],
        ["J2043+1711",null,0.0023798789240134528,0.2,2.3,0.121,null],
        ["J2043+2740",null,0.09613056295,3,15,null,null],
        ["J2043+31",null,0.937,null,null,null,null],
        ["J2043+7045",null,0.588,37,63.7,null,null],
        ["J2044+28",null,1.618,31,null,null,null],
        ["J2044+3843_P",null,null,null,null,null,null],
        ["J2044+4331_P",null,16.6064,null,null,0.0049,null],
        ["J2044+4614",null,1.3927154635,26.2,null,null,null],
        ["J2045+0912",null,0.3955551117394,10,3.5,null,null],
        ["J2045+3633",null,0.03168184275729975,12.3,null,null,null],
        ["J2045+4431_P",null,0.14183,null,null,0.0204,null],
        ["J2045-68",null,0.00296,null,null,null,null],
        ["J2045-6837",null,0.0029622548584407795,null,null,0.25,null],
        ["J2046+1540","B2044+15",1.1382856833155095,15,11.5,1.7,null],
        ["J2046+4236_P",null,0.52382,null,null,0.0927,null],
        ["J2046+4253_P",null,0.33115,null,null,0.2314,null],
        ["J2046+5708","B2045+56",0.4767348421469905,14,4.6,0.3,null],
        ["J2046-0421","B2043-04",1.5469381168652414,20.8,20,1.7,null],
        ["J2047+1053",null,0.004285927910802672,0.3,null,null,null],
        ["J2047+5029",null,0.4459445573850318,2.5,null,0.38,0.22],
        ["J2048+2255",null,0.2839009641977,6.2,1.8,null,null],
        ["J2048+4951",null,0.5683010075352668,null,null,0.12,null],
        ["J2048-1616","B2045-16",1.9615846233291023,12,116,22,null],
        ["J2050+1259",null,1.2210199817719738,61,0.4,0.05,null],
        ["J2051+1248",null,0.55316745256,49,null,null,null],
        ["J2051+4434_P",null,1.30316,229.81,null,0.342,null],
        ["J2051+50",null,0.00168,0.1,null,null,null],
        ["J2051-0827",null,0.0045086418200064255,0.44,7.9,2.8,null],
        ["J2052+1219",null,0.0019852562818186777,null,null,null,null],
        ["J2052+4421_P",null,0.37531,39.5,null,0.28,null],
        ["J2053+1718",null,0.11926776027515096,1.5,null,0.003,null],
        ["J2053+4455_P",null,10.7,null,null,0.0069,null],
        ["J2053+4650",null,0.012586275314350004,1.401,null,null,null],
        ["J2053+4718",null,4.910379078270003,52.25,null,null,null],
        ["J2053-7200","B2048-72",0.34133643647157097,25,29,6,null],
        ["J2054-39",null,0.977,9,null,null,null],
        ["J2055+1545",null,0.00216,0.3,null,null,null],
        ["J2055+2209","B2053+21",0.815181102764579,19.9,9,null,null],
        ["J2055+2539",null,0.3195614414174036,null,null,null,null],
        ["J2055+3630","B2053+36",0.22150763827703512,8.8,28,2.6,null],
        ["J2055+3829",null,0.0020892903021910657,0.1,null,null,null],
        ["J2057+2128",null,1.1666396036088216,27.9,null,null,null],
        ["J2057+4557_P",null,0.22538,null,null,0.1336,null],
        ["J2057+4701",null,0.5595736147169256,8.267,null,null,null],
        ["J2100+4712_P",null,1.45872,null,null,0.0073,null],
        ["J2101+4636_P",null,0.29529,null,null,0.133,null],
        ["J2101+5028_P",null,0.25444,null,null,0.0585,null],
        ["J2102+38",null,1.19,33,null,null,null],
        ["J2102+5047_P",null,0.3582,null,null,0.022,null],
        ["J2103+4602_P",null,1.35994,null,null,0.0103,null],
        ["J2103+4620_P",null,0.23516,null,null,0.1572,null],
        ["J2104+2830",null,0.4057291193434513,null,null,null,null],
        ["J2104+4644_P",null,0.10823,null,null,0.0383,null],
        ["J2105+07",null,3.74663,104,null,null,null],
        ["J2105+19",null,3.5297,35,null,null,null],
        ["J2105+28",null,0.405737,7,8.6,null,null],
        ["J2105+6223",null,2.3048788376625415,null,null,null,null],
        ["J2106+4602_P",null,1.18445,null,null,0.0218,null],
        ["J2108+4441","B2106+44",0.41487053687369,24.1,26,5.4,null],
        ["J2108+4516",null,0.5772309434487178,15.1,null,null,null],
        ["J2108+5001",null,0.2444613752,null,null,null,null],
        ["J2108-3429",null,1.4231049123943769,14,6,0.5,null],
        ["J2111+2106",null,3.9538529596,52.1,null,null,null],
        ["J2111+2132",null,1.0595321458021352,null,null,0.009,null],
        ["J2111+40",null,4.061,null,null,null,null],
        ["J2111+4606",null,0.15782992473528157,null,null,null,null],
        ["J2112+0740",null,0.27536086771212076,null,null,0.089,null],
        ["J2112+4058",null,4.06075481158728,41,null,null,null],
        ["J2113+2754","B2110+27",1.202851754084704,14.7,18,1.1,null],
        ["J2113+4644","B2111+46",1.0146847931889054,60.5,230,19,null],
        ["J2113+67",null,0.55217,9,1,null,null],
        ["J2113+73",null,null,null,null,null,null],
        ["J2115+5448",null,0.002602876738872,null,null,null,null],
        ["J2115+6702",null,0.552121964131719,null,null,null,null],
        ["J2116+1345",null,0.00221851197202332,null,null,null,null],
        ["J2116+1414","B2113+14",0.4401530669474793,8.6,9,0.8,null],
        ["J2116+3701",null,0.14588418655248736,2.8,null,null,null],
        ["J2116+4906_P",null,1.60231,null,null,0.0481,null],
        ["J2117+4622_P",null,0.00495,null,null,0.0215,null],
        ["J2118+5143",null,0.370223049,null,null,null,null],
        ["J2122+2426",null,0.54142115903,15.8,null,null,null],
        ["J2123+3624",null,1.2940298207713774,21,null,null,null],
        ["J2123+5434",null,0.1388680725891097,2.4,null,null,null],
        ["J2124+1407","B2122+13",0.6940541217243695,24,4,null,null],
        ["J2124+34",null,0.489,null,null,null,null],
        ["J2124-3358",null,0.004931114945113724,0.524,17,4.5,null],
        ["J2125+52_P",null,5.8015,null,null,null,null],
        ["J2127-6648","B2123-67",0.3257716011373503,16,7,0.6,null],
        ["J2128+5004_P",null,0.20155,null,null,0.0057,null],
        ["J2128+5051_P",null,0.33103,null,null,0.0283,null],
        ["J2129+1210A","B2127+11A",0.1106646888626611,2.1,1.7,0.2,null],
        ["J2129+1210B","B2127+11B",0.05613304245365169,2.7,1,null,null],
        ["J2129+1210C","B2127+11C",0.03052929614585133,1.2,0.64,null,null],
        ["J2129+1210D","B2127+11D",0.004802803352417647,0.7,0.34,null,null],
        ["J2129+1210E","B2127+11E",0.004651435392620927,0.4,0.24,null,null],
        ["J2129+1210F","B2127+11F",0.0040270425478399485,0.8,0.14,null,null],
        ["J2129+1210G","B2127+11G",0.037660166973304605,0.8,0.13,null,null],
        ["J2129+1210H","B2127+11H",0.006743394241793567,0.7,0.16,null,null],
        ["J2129+1210I",null,0.005122197447291436,null,null,null,null],
        ["J2129+1210J",null,0.01184248369830747,null,null,null,null],
        ["J2129+1210K",null,1.9284507076604387,null,null,null,null],
        ["J2129+1210L",null,3.960716392855438,null,null,null,null],
        ["J2129+4106_P",null,3.26074,null,null,0.0029,null],
        ["J2129+4119",null,1.6874182953084411,46.9,null,null,null],
        ["J2129+4430_P",null,0.64933,null,null,0.0363,null],
        ["J2129-0429",null,0.007613937470415,1.5,0.5,null,null],
        ["J2129-5721",null,0.003726348486023947,0.262,14,0.97,null],
        ["J2131-31",null,3.325,54,null,null,null],
        ["J2133-0049A",null,0.010149285744092164,0.743,null,0.013,null],
        ["J2133-0049B",null,0.0069745477565546655,0.298,null,0.0047,null],
        ["J2133-0049C",null,0.003004931540898754,0.209,null,0.039,null],
        ["J2133-0049D",null,0.004215735030735532,0.18,null,0.0082,null],
        ["J2133-0049E",null,0.003703119143983141,0.107,null,0.0011,null],
        ["J2133-0049F",null,0.004780887849334785,0.121,null,0.0018,null],
        ["J2133-0049G",null,0.0025357395398257457,0.0859,null,0.0063,null],
        ["J2136-1606",null,1.227235404899805,31,null,null,null],
        ["J2136-5046",null,0.2673223183349886,11,null,0.6,null],
        ["J2137+6428",null,1.7509891632518462,19,null,null,null],
        ["J2138+4911",null,0.696171,11.8,null,null,null],
        ["J2138+69",null,0.22,null,null,null,null],
        ["J2139+00",null,0.31247,15.3,null,null,null],
        ["J2139+2242",null,1.08351372724033,53,null,null,null],
        ["J2139+4716",null,0.2828493454087831,null,null,null,null],
        ["J2139+4738_P",null,0.55704,8,null,0.012,null],
        ["J2140-2310A",null,0.01101932906888,null,null,0.08,null],
        ["J2140-2311B",null,0.012986381207999931,null,null,null,null],
        ["J2143+0654",null,9.428228878119159,null,null,null,null],
        ["J2144-3933",null,8.509827491,16.5,16,0.8,null],
        ["J2144-5237",null,0.005041453778516237,null,null,1.4,null],
        ["J2145+2158",null,1.419,24,null,null,null],
        ["J2145-0750",null,0.016052423921072694,0.4,46,5.5,null],
        ["J2148-34",null,0.927,20,null,null,null],
        ["J2149+6329","B2148+63",0.38014034472,18.1,32,2.9,null],
        ["J2150+3427",null,0.6542799967041435,null,null,0.288,null],
        ["J2150+5247","B2148+52",0.33220567154090014,9.6,15.6,2,null],
        ["J2150-0326",null,0.003510702857014505,0.24,null,0.48,null],
        ["J2151+19",null,1.036,null,null,null,null],
        ["J2151+2315",null,0.593533613,31,1.6,null,null],
        ["J2151+5128",null,1.0519028955,null,null,null,null],
        ["J2153+44_P",null,2.89297,null,null,null,null],
        ["J2154-2812",null,1.3433614881,7.9,null,null,null],
        ["J2155+2813",null,1.6090199964,24.4,2.1,null,null],
        ["J2155-3118","B2152-31",1.030003273247361,19,12,0.66,null],
        ["J2155-5641","B2151-56",1.373654387,50,2.1,0.361,null],
        ["J2156+2618",null,0.49814907254,10.5,2.7,null,null],
        ["J2157+4017","B2154+40",1.5252656339647226,38.6,105,17,null],
        ["J2158-27",null,0.477,14,null,null,null],
        ["J2158-2734",null,0.4771978722629944,null,null,null,null],
        ["J2159+0202",null,0.6655605600851733,null,null,0.14,null],
        ["J2201+33",null,0.966,null,null,null,null],
        ["J2202+21",null,null,22,null,null,null],
        ["J2202+5040",null,0.7453792781773053,null,null,null,null],
        ["J2203+50",null,0.745,29,null,null,null],
        ["J2204+2700",null,0.08470261549132646,2.9,null,null,null],
        ["J2205+1444",null,0.93801422813,12.4,1.5,null,null],
        ["J2205+6012",null,0.0024155479489811,0.035,null,0.49,0.14],
        ["J2206+6151",null,0.322673549948,25,1.2,0.8,null],
        ["J2207-15",null,0.766,25,null,null,null],
        ["J2208+4056",null,0.6369573936136667,28.8,null,null,null],
        ["J2208+4610",null,0.6425055485748384,36.7,null,null,null],
        ["J2208+5500",null,0.9331625139449529,8.6,null,0.4,null],
        ["J2209+2117",null,1.7769606794958237,28.6,null,null,null],
        ["J2210+5712",null,2.05743,63,1.1,null,null],
        ["J2212+2450",null,0.003907515126586912,0.8,null,null,null],
        ["J2212+2933","B2210+29",1.0045925288525703,45.1,6.3,0.9,null],
        ["J2213+53",null,0.751,null,null,null,null],
        ["J2214+3000",null,0.003119226581323024,0.3,null,0.53,0.36],
        ["J2214+5357",null,0.7511946863510442,null,null,null,null],
        ["J2215+1538",null,0.37419801039605743,4.4,3.7,null,null],
        ["J2215+45",null,2.7231360577193913,null,null,null,null],
        ["J2215+4524",null,2.723049823487842,null,null,null,null],
        ["J2215+5135",null,0.0026096197234460818,0.1,5,0.14,0.11],
        ["J2216+5759",null,0.41910226464,null,null,0.23,null],
        ["J2217+5733",null,1.0568443686322069,13,3.7,0.5,null],
        ["J2219+4754","B2217+47",0.5384688219194349,8.2,111,3,null],
        ["J2221+81",null,null,null,null,null,null],
        ["J2222+2923",null,0.2813991427542691,5.9,null,null,null],
        ["J2222+5602",null,1.336,42,21.1,null,null],
        ["J2222-0137",null,0.032817859064378854,1,null,0.9,null],
        ["J2224+0823_P",null,1.6322571860223798,null,null,17,null],
        ["J2225+35",null,0.94,7,null,null,null],
        ["J2225+6535","B2224+65",0.6825424974056123,21.1,22,2,null],
        ["J2226-03",null,0.7697,null,null,null,null],
        ["J2227+3038",null,0.8424079226321566,40,2.4,null,null],
        ["J2228+6447",null,1.8929818035316528,52,null,null,null],
        ["J2228-65",null,2.74598,null,null,null,null],
        ["J2229+2643",null,0.002977819295745368,0.5,5,0.8,null],
        ["J2229+40",null,0.2729,null,null,null,null],
        ["J2229+6114",null,0.051647587399703994,4,1.5,0.25,null],
        ["J2229+6205","B2227+61",0.4430545606381078,25.8,17,0.8,null],
        ["J2234+0611",null,0.0035765816316731076,0.1,1.3,0.46,null],
        ["J2234+0944",null,0.003627027895734231,0.4,null,1.9,0.8],
        ["J2234+2114",null,1.3587453596575505,40,2.6,null,null],
        ["J2235+1506",null,0.059767357984547,2.2,3,null,null],
        ["J2236+4929",null,0.9317148785406617,null,null,0.016,null],
        ["J2236-5527",null,0.006907549392921,0.195,null,0.282,null],
        ["J2237+2828",null,1.0773950915196422,null,null,null,null],
        ["J2238+5015",null,0.5600971676,null,null,null,null],
        ["J2238+5903",null,0.16273385298999107,null,null,null,null],
        ["J2238+6021",null,3.07,25,111.1,null,null],
        ["J2240+5832",null,0.13993451064901624,10,null,2.7,null],
        ["J2241+6941",null,0.8554012657088741,45,null,null,null],
        ["J2241-5236",null,0.0021866997725548446,0.07,null,1.83,null],
        ["J2242+6346",null,0.4609577061878633,null,null,null,null],
        ["J2242+6950","B2241+69",1.664500786185397,25.8,2.4,0.4,null],
        ["J2243+1518",null,0.596799464458,17.2,0.16,null,null],
        ["J2244+63",null,0.461,17,null,null,null],
        ["J2248-0101",null,0.4772331191229628,8.4,11,0.5,null],
        ["J2251+24",null,1.797962,18.4,null,null,null],
        ["J2251-3711",null,12.122564931278209,40,null,0.15,null],
        ["J2252+2455",null,1.7979082187368651,null,null,null,null],
        ["J2253+12",null,0.9793,null,null,null,null],
        ["J2253+1516",null,0.7922359863270754,9.3,2.4,null,null],
        ["J2256-1024",null,0.002294531816964991,0.2,13,0.73,null],
        ["J2257+5909","B2255+58",0.3682464543421859,14.8,34,9.2,null],
        ["J2257-16",null,0.469,6,null,null,null],
        ["J2258+5222_P",null,1.03056,null,null,0.0525,null],
        ["J2300+50_P",null,3.6484,null,null,null,null],
        ["J2300+52",null,0.4265,null,null,null,null],
        ["J2301+5852",null,6.979070970328889,null,null,null,null],
        ["J2302+4442",null,0.005192324648754203,0.34,11.3,1.4,null],
        ["J2302+48",null,0.7421,null,null,null,null],
        ["J2302+6028",null,1.20640428819,20,12,null,null],
        ["J2305+19",null,0.2693,null,null,null,null],
        ["J2305+3100","B2303+30",1.5758863383593105,22.3,24,2.2,null],
        ["J2305+4707","B2303+46",1.066371071565,20,1.9,null,null],
        ["J2306+3124",null,0.34160250343013554,8,null,null,null],
        ["J2307+2225",null,0.535828895432,10.7,2,null,null],
        ["J2308+5547","B2306+55",0.47506767480218853,26.9,19,1.9,null],
        ["J2310+6706",null,1.94478897277861,null,null,null,null],
        ["J2310-0555",null,0.0026125867919415,null,null,null,null],
        ["J2312+21",null,1.256,null,null,null,null],
        ["J2312+6931",null,0.8133747783166858,18,null,null,null],
        ["J2313+4253","B2310+42",0.3494336821330819,8.8,89,15,null],
        ["J2315+58",null,1.061,38,null,null,null],
        ["J2316+5619",null,1.06160028866611,null,null,null,null],
        ["J2316+75",null,null,null,null,null,null],
        ["J2317+1439",null,0.003445251072361068,0.4,7,0.6,null],
        ["J2317+2149","B2315+21",1.4446531023167097,23.3,15,0.9,null],
        ["J2319+4919_P",null,0.54406513568,null,null,null,null],
        ["J2319+6411",null,0.21601827884014,38,null,0.27,null],
        ["J2321+6024","B2319+60",2.2564884268242373,131.1,36,12,null],
        ["J2322+2057",null,0.004808428289462997,0.3,null,0.34,null],
        ["J2322-2650",null,0.0034630991790879,0.11,null,0.212,null],
        ["J2323+1214",null,3.7594914873614753,9.62,null,0.144,null],
        ["J2324-6054","B2321-61",2.3474887644584896,46,4,1,null],
        ["J2325+6316","B2323+63",1.4363095361494225,131.2,8,2.1,null],
        ["J2325-0530",null,0.8687351150250493,14,null,null,null],
        ["J2326+6113","B2324+60",0.23365196949460368,14.7,17,4.4,null],
        ["J2326+6141",null,0.79,26,null,null,null],
        ["J2326+6243",null,0.2661489199136356,null,null,null,null],
        ["J2327+62",null,0.266,4,null,null,null],
        ["J2329+16",null,0.6321,null,null,null,null],
        ["J2329+2654_P",null,2.541132792272825,null,null,30,null],
        ["J2329+4743",null,0.728408609085,5.7,0.5,null,null],
        ["J2330-2005","B2327-20",1.6436221853269488,8,42,2.9,null],
        ["J2333+20",null,2.2911,null,null,null,null],
        ["J2333+6145",null,0.756899382059,23,null,0.47,null],
        ["J2333-5526",null,0.0021024602801435217,null,null,null,null],
        ["J2336-0151",null,1.0298390154866666,41,null,null,null],
        ["J2337+6151","B2334+61",0.4953698680281026,14.5,10,1.4,null],
        ["J2338+4818",null,0.11871025069021034,1.39,null,null,null],
        ["J2339-0533",null,0.0028842267415472283,null,null,null,null],
        ["J2340+08",null,0.3033,15.3,null,null,null],
        ["J2343+6221",null,1.799,56,null,null,null],
        ["J2346-0609",null,1.1814633829674592,51,11,2,null],
        ["J2347+02",null,1.38347,26,null,null,null],
        ["J2350+3140",null,0.5080916900925384,12.7,null,null,null],
        ["J2351+6500",null,1.1648831649775786,null,null,null,null],
        ["J2351+8533",null,1.0117271911102368,18,4.9,null,null],
        ["J2352+65",null,1.164,33,26.5,null,null],
        ["J2354+6155","B2351+61",0.944783886655436,10.4,17,5,null],
        ["J2354-2250",null,0.557996,9,null,null,null],
        ["J2355+0051",null,0.003718992304493302,0.5,null,0.156,null],
        ["J2355+04",null,0.958,null,null,null,null],
        ["J2355+1523",null,1.0943962646965324,null,null,null,null],
        ["J2355+2246",null,1.8409859072,47.6,0.9,null,null],
        /* ATNF_ROWS_END */
    ]);

    const PSRCAT_PROVENANCE = Object.freeze({
        catalogVersion: "2.8.1",
        dapVersion: 17,
        dapIdentifier: "csiro:62107",
        dapCollectionId: 75111,
        dapLandingUrl: "https://data.csiro.au/collection/csiro:62107",
        dapMetadataUrl: "https://data.csiro.au/dap/ws/v2/collections/csiro:62107.json",
        doiUrl: "https://doi.org/10.25919/mjwb-7w32",
        databaseFileId: 100508507,
        databaseFileUrl: "https://data.csiro.au/dap/ws/v2/collections/75111/data/100508507",
        databaseSha256: "29E423E5878D8B97E397425B6A1FE1529396A7B25909E3C1D56924641DB6C63B",
        licenseName: "BSD 3-Clause Licence",
        bundledLicenseFileId: 100508503,
        bundledLicenseFileUrl: "https://data.csiro.au/dap/ws/v2/collections/75111/data/100508503",
        dapLicenseId: 1241,
        dapLicenseApiUrl: "https://data.csiro.au/dap/ws/v2/licences/1241",
        licenseDeedUrl: "https://research.csiro.au/dap/licences/bsd-3-clause-licence/",
        compactSnapshotSha256: "A3787FFB483CF7321430F0F8FE9F69E5C0F9B229037A567A38001DEF19889920",
        embeddedCanonicalRowsSha256: "78CFDA31A0153BF8BC6ECC47A42BAB73E07A48BE55E4329E3EA977445CFAD698",
        attribution: "Hobbs, George; Kapur, Agastya; & Toomey, Lawrence (2025): PSRCAT v2: The ATNF Pulsar Catalogue. CSIRO. v17. Software. https://doi.org/10.25919/mjwb-7w32"
    });

    const PSRCAT_LICENSE_NOTICE = "CSIRO Open Source Software Licence v1.0\n(Based on MIT/BSD Open Source Licence)\nIMPORTANT – PLEASE READ CAREFULLY\nThis document contains the terms under which CSIRO agrees to licence its Software to you.  This is a template and further information relevant to the licence is set out in the Supplementary Licence specific to the Software you are licensing from CSIRO.  Both documents together form this agreement.\nThe Software is copyright (c) Commonwealth Scientific and Industrial Research Organisation (CSIRO) ABN 41 687 119 230.\nRedistribution and use of this Software in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\n\tRedistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\n\tRedistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\n\tNeither the name of CSIRO nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission of CSIRO.\nEXCEPT AS EXPRESSLY STATED IN THIS AGREEMENT AND TO THE FULL EXTENT PERMITTED BY APPLICABLE LAW, THE SOFTWARE IS PROVIDED “AS-IS”. CSIRO MAKES NO REPRESENTATIONS, WARRANTIES OR CONDITIONS OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY REPRESENTATIONS, WARRANTIES OR CONDITIONS REGARDING THE CONTENTS OR ACCURACY OF THE SOFTWARE, OR OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, THE ABSENCE OF LATENT OR OTHER DEFECTS, OR THE PRESENCE OR ABSENCE OF ERRORS, WHETHER OR NOT DISCOVERABLE.\nTO THE FULL EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CSIRO BE LIABLE ON ANY LEGAL THEORY (INCLUDING, WITHOUT LIMITATION, IN AN ACTION FOR BREACH OF CONTRACT, NEGLIGENCE OR OTHERWISE) FOR ANY CLAIM, LOSS, DAMAGES OR OTHER LIABILITY HOWSOEVER INCURRED.  WITHOUT LIMITING THE SCOPE OF THE PREVIOUS SENTENCE THE EXCLUSION OF LIABILITY SHALL INCLUDE: LOSS OF PRODUCTION OR OPERATION TIME, LOSS, DAMAGE OR CORRUPTION OF DATA OR RECORDS; OR LOSS OF ANTICIPATED SAVINGS, OPPORTUNITY, REVENUE, PROFIT OR GOODWILL, OR OTHER ECONOMIC LOSS; OR ANY SPECIAL, INCIDENTAL, INDIRECT, CONSEQUENTIAL, PUNITIVE OR EXEMPLARY DAMAGES, ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT, ACCESS OF THE SOFTWARE OR ANY OTHER DEALINGS WITH THE SOFTWARE, EVEN IF CSIRO HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH CLAIM, LOSS, DAMAGES OR OTHER LIABILITY.\nAPPLICABLE LEGISLATION SUCH AS THE AUSTRALIAN CONSUMER LAW MAY APPLY REPRESENTATIONS, WARRANTIES, OR CONDITIONS, OR IMPOSES OBLIGATIONS OR LIABILITY ON CSIRO THAT CANNOT BE EXCLUDED, RESTRICTED OR MODIFIED TO THE FULL EXTENT SET OUT IN THE EXPRESS TERMS OF THIS CLAUSE ABOVE “CONSUMER GUARANTEES”.  TO THE EXTENT THAT SUCH CONSUMER GUARANTEES CONTINUE TO APPLY, THEN TO THE FULL EXTENT PERMITTED BY THE APPLICABLE LEGISLATION, THE LIABILITY OF CSIRO UNDER THE RELEVANT CONSUMER GUARANTEE IS LIMITED (WHERE PERMITTED AT CSIRO’S OPTION) TO ONE OF FOLLOWING REMEDIES OR SUBSTANTIALLY EQUIVALENT REMEDIES:\n(a) THE REPLACEMENT OF THE SOFTWARE, THE SUPPLY OF EQUIVALENT SOFTWARE, OR SUPPLYING RELEVANT SERVICES AGAIN;\n(b) THE REPAIR OF THE SOFTWARE;\n(c) THE PAYMENT OF THE COST OF REPLACING THE SOFTWARE, OF ACQUIRING EQUIVALENT SOFTWARE, HAVING THE RELEVANT SERVICES SUPPLIED AGAIN, OR HAVING THE SOFTWARE REPAIRED.\nIN THIS CLAUSE, CSIRO INCLUDES ANY THIRD PARTY AUTHOR OR OWNER OF ANY PART OF THE SOFTWARE OR MATERIAL DISTRIBUTED WITH IT.  CSIRO MAY ENFORCE ANY RIGHTS ON BEHALF OF THE RELEVANT THIRD PARTY.\nIf you intend to access the Software in connection with your employment or as an agent for a principal, you should only accept this agreement if you have been authorised to do so by your employer or principal (as applicable). By accepting this agreement, you are warranting to CSIRO that you are authorised to do so on behalf of your employer or principal (as applicable).\nThe Software may contain third party material obtained by CSIRO under licence. Your rights to such material as part of the Software under this agreement is subject to any separate licence terms identified by CSIRO as part of the Software release - including as part of the Supplementary Licence, or as a separate file.  Those third party licence terms may require you to download the relevant software from a third party site, or may mean that the third party licensor (and not CSIRO) grants you a licence directly for those components of the Software. It is your responsibility to ensure that you have the necessary rights to such third party material.\n";

    const PULSAR_CATALOGUE = Object.freeze({
        source: "ATNF Pulsar Catalogue",
        version: "2.8.1",
        releasedOn: "2026-06-18",
        retrievedOn: "2026-08-05",
        sourceUrl: "https://www.atnf.csiro.au/research/pulsar/psrcat/",
        historyUrl: "https://www.atnf.csiro.au/research/pulsar/psrcat/catalogueHistory.html",
        parameterHelpUrl: "https://www.atnf.csiro.au/research/pulsar/psrcat/psrcat_help.html",
        fullSnapshotRecordCount: 4393,
        embeddedRecordCount: PULSAR_ROWS.length,
        mode: PULSAR_ROWS.length ? "embedded-snapshot" : "manual-fallback",
        provenance: PSRCAT_PROVENANCE,
        licenseNotice: PSRCAT_LICENSE_NOTICE,
        extractionRule: "Split psrcat.db on @ record delimiters; ignore comments; use the last occurrence of each retained key; keep PSRJ and PSRB; use P0 or derive P0 as 1/F0; retain W50, S400, S1400 and S2000; convert absent, NULL, non-finite or non-positive physical values to null; exclude no records.",
        acknowledgement: "Manchester, R. N., Hobbs, G. B., Teoh, A. & Hobbs, M. (2005), AJ 129, 1993–2006, DOI 10.1086/428488."
    });

    const FIELD_META = Object.freeze({
        collectingAreaM2: Object.freeze({ ui: "area", label: "Collecting area" }),
        efficiencyPercent: Object.freeze({ ui: "efficiency", label: "Aperture efficiency" }),
        centreFrequencyMHz: Object.freeze({ ui: "centreFrequency", label: "Centre / reference frequency" }),
        bandwidthMHz: Object.freeze({ ui: "bandwidth", label: "Usable bandwidth" }),
        systemTemperatureK: Object.freeze({ ui: "tsys", label: "Total system temperature" }),
        polarisations: Object.freeze({ ui: "polarisations", label: "Summed polarisations" }),
        fluxJy: Object.freeze({ ui: "flux", label: "Mean flux density" }),
        integrationTimeSeconds: Object.freeze({ ui: "time", label: "Observing time" }),
        periodSeconds: Object.freeze({ ui: "period", label: "Pulse period" }),
        widthSeconds: Object.freeze({ ui: "width", label: "Pulse width" }),
        fluxFrequencyMHz: Object.freeze({ ui: "fluxFrequency", label: "Flux measurement frequency" })
    });

    const INSTRUMENT_KEYS = Object.freeze([
        "collectingAreaM2",
        "efficiencyPercent",
        "centreFrequencyMHz",
        "bandwidthMHz",
        "systemTemperatureK",
        "polarisations"
    ]);

    const TELESCOPE_UI_KEYS = Object.freeze([
        "area",
        "efficiency",
        "centreFrequency",
        "bandwidth",
        "tsys",
        "polarisations"
    ]);

    const PULSAR_UI_KEYS = Object.freeze([
        "period",
        "width",
        "flux",
        "fluxFrequency"
    ]);

    const UI_LABELS = Object.freeze({
        area: "collecting area",
        efficiency: "aperture efficiency",
        centreFrequency: "centre frequency",
        bandwidth: "bandwidth",
        tsys: "total system temperature",
        polarisations: "summed polarisations",
        period: "pulse period",
        width: "pulse width",
        flux: "flux density",
        fluxFrequency: "flux measurement frequency"
    });

    function mhzToHz(valueMHz) {
        return Number(valueMHz) * 1e6;
    }

    function milliJyToJy(valueMilliJy) {
        return Number(valueMilliJy) / 1000;
    }

    function millisecondsToSeconds(valueMilliseconds) {
        return Number(valueMilliseconds) / 1000;
    }

    function telescopeGainKPerJy(collectingAreaM2, efficiencyPercent) {
        const efficiencyFraction = Number(efficiencyPercent) / 100;
        return ((efficiencyFraction * Number(collectingAreaM2)) / (2 * BOLTZMANN_CONSTANT)) * 1e-26;
    }

    function isBlank(value) {
        return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
    }

    function validateCalculationInputs(rawInputs) {
        const errors = {};
        const values = {};

        Object.keys(FIELD_META).forEach(function (key) {
            const meta = FIELD_META[key];
            const rawValue = rawInputs ? rawInputs[key] : undefined;

            if (isBlank(rawValue)) {
                errors[key] = meta.label + " is required.";
                return;
            }

            const numericValue = Number(rawValue);
            if (!Number.isFinite(numericValue)) {
                errors[key] = meta.label + " must be a finite number.";
                return;
            }

            if (numericValue <= 0) {
                errors[key] = meta.label + " must be greater than zero.";
                return;
            }

            values[key] = numericValue;
        });

        if (!errors.efficiencyPercent && values.efficiencyPercent > 100) {
            errors.efficiencyPercent = "Aperture efficiency must be no greater than 100%.";
        }

        if (!errors.polarisations) {
            if (!Number.isInteger(values.polarisations) || ALLOWED_POLARISATIONS.indexOf(values.polarisations) === -1) {
                errors.polarisations = "Summed polarisations must be 1 or 2.";
            }
        }

        if (!errors.periodSeconds && !errors.widthSeconds && values.widthSeconds >= values.periodSeconds) {
            errors.widthSeconds = "Pulse width must be smaller than the pulse period.";
        }

        return {
            valid: Object.keys(errors).length === 0,
            values: values,
            errors: errors
        };
    }

    function calculateSnrDetails(rawInputs) {
        const validation = validateCalculationInputs(rawInputs);
        if (!validation.valid) {
            throw new RangeError(Object.keys(validation.errors).map(function (key) {
                return validation.errors[key];
            }).join(" "));
        }

        const values = validation.values;
        const gainKPerJy = telescopeGainKPerJy(values.collectingAreaM2, values.efficiencyPercent);
        const timeBandwidthFactor = Math.sqrt(
            values.polarisations *
            values.integrationTimeSeconds *
            mhzToHz(values.bandwidthMHz)
        );
        const dutyCycleFactor = Math.sqrt(
            (values.periodSeconds - values.widthSeconds) / values.widthSeconds
        );
        // Ideal pulsed radiometer equation: beta = 1 and Tsys is the total on-source temperature.
        const snr = (
            (values.fluxJy * gainKPerJy) / values.systemTemperatureK
        ) * timeBandwidthFactor * dutyCycleFactor;

        if (!Number.isFinite(snr) || snr <= 0) {
            throw new RangeError("The supplied values did not produce a finite, positive S/N.");
        }

        return {
            snr: snr,
            gainKPerJy: gainKPerJy,
            dutyCycleFactor: dutyCycleFactor,
            values: values
        };
    }

    function calculateSnr(rawInputs) {
        return calculateSnrDetails(rawInputs).snr;
    }

    function formatSignificant(value, significantFigures) {
        const figures = significantFigures || 3;
        if (!Number.isFinite(value)) {
            return "—";
        }
        if (value === 0) {
            return "0";
        }

        const absolute = Math.abs(value);
        if (absolute >= 1e5 || absolute < 1e-3) {
            return value.toExponential(figures - 1).replace("e+", "e");
        }
        return String(Number(value.toPrecision(figures)));
    }

    function normalisePulsarQuery(value) {
        return String(value || "")
            .trim()
            .toUpperCase()
            .replace(/^PSR\s*/, "")
            .replace(/[−–—]/g, "-")
            .replace(/\s+/g, "");
    }

    function pulsarEntryFromRow(row, index) {
        return {
            index: index,
            jName: row[0],
            bName: row[1] || null,
            periodSeconds: row[2] === null ? null : row[2],
            width50Milliseconds: row[3] === null ? null : row[3],
            fluxMilliJy: {
                "400": row[4] === null ? null : row[4],
                "1400": row[5] === null ? null : row[5],
                "2000": row[6] === null ? null : row[6]
            }
        };
    }

    function searchPulsars(query, limit) {
        const normalisedQuery = normalisePulsarQuery(query);
        const resultLimit = Math.max(1, Math.min(Number(limit) || 8, 20));
        if (normalisedQuery.length < 2 || !PULSAR_ROWS.length) {
            return [];
        }

        const matches = [];
        for (let index = 0; index < PULSAR_ROWS.length; index += 1) {
            const row = PULSAR_ROWS[index];
            const jName = normalisePulsarQuery(row[0]);
            const bName = normalisePulsarQuery(row[1]);
            const exact = jName === normalisedQuery || bName === normalisedQuery;
            const prefix = jName.indexOf(normalisedQuery) === 0 || bName.indexOf(normalisedQuery) === 0;
            const contains = jName.indexOf(normalisedQuery) !== -1 || bName.indexOf(normalisedQuery) !== -1;

            if (!contains) {
                continue;
            }

            matches.push({
                rank: exact ? 0 : (prefix ? 1 : 2),
                entry: pulsarEntryFromRow(row, index)
            });
        }

        matches.sort(function (left, right) {
            if (left.rank !== right.rank) {
                return left.rank - right.rank;
            }
            return left.entry.jName.localeCompare(right.entry.jName);
        });

        return matches.slice(0, resultLimit).map(function (match) {
            return match.entry;
        });
    }

    const publicApi = Object.freeze({
        BOLTZMANN_CONSTANT: BOLTZMANN_CONSTANT,
        BUILT_IN_TELESCOPES: BUILT_IN_TELESCOPES,
        PULSAR_CATALOGUE: PULSAR_CATALOGUE,
        calculateSnr: calculateSnr,
        calculateSnrDetails: calculateSnrDetails,
        validateCalculationInputs: validateCalculationInputs,
        telescopeGainKPerJy: telescopeGainKPerJy,
        mhzToHz: mhzToHz,
        milliJyToJy: milliJyToJy,
        millisecondsToSeconds: millisecondsToSeconds,
        searchPulsars: searchPulsars,
        formatSignificant: formatSignificant
    });

    if (typeof globalThis !== "undefined") {
        globalThis.SNRCalc = publicApi;
    }

    if (typeof document === "undefined") {
        return;
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function createOption(value, label) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        return option;
    }

    function configurationLabel(configuration) {
        return configuration.displayName || configuration.telescopeName;
    }

    function isPositiveFinite(value) {
        return Number.isFinite(Number(value)) && Number(value) > 0;
    }

    function isValidCustomConfiguration(configuration) {
        return configuration &&
            typeof configuration.id === "string" &&
            configuration.id.length > 0 &&
            configuration.id.length <= 120 &&
            configuration.id !== "manual" &&
            !BUILT_IN_TELESCOPES.some(function (preset) {
                return preset.id === configuration.id;
            }) &&
            typeof configuration.telescopeName === "string" &&
            configuration.telescopeName.trim().length > 0 &&
            configuration.telescopeName.length <= 80 &&
            isPositiveFinite(configuration.collectingAreaM2) &&
            isPositiveFinite(configuration.efficiencyPercent) &&
            Number(configuration.efficiencyPercent) <= 100 &&
            isPositiveFinite(configuration.centreFrequencyMHz) &&
            isPositiveFinite(configuration.bandwidthMHz) &&
            isPositiveFinite(configuration.systemTemperatureK) &&
            ALLOWED_POLARISATIONS.indexOf(Number(configuration.polarisations)) !== -1;
    }

    function normaliseCustomConfiguration(configuration) {
        const savedDate = typeof configuration.savedOn === "string" && /^\d{4}-\d{2}-\d{2}$/.test(configuration.savedOn)
            ? configuration.savedOn
            : (typeof configuration.lastVerified === "string" && /^\d{4}-\d{2}-\d{2}$/.test(configuration.lastVerified)
                ? configuration.lastVerified
                : "");
        return {
            id: configuration.id,
            telescopeName: configuration.telescopeName.trim(),
            configurationName: "Custom configuration",
            collectingAreaM2: Number(configuration.collectingAreaM2),
            efficiencyPercent: Number(configuration.efficiencyPercent),
            centreFrequencyMHz: Number(configuration.centreFrequencyMHz),
            bandwidthMHz: Number(configuration.bandwidthMHz),
            systemTemperatureK: Number(configuration.systemTemperatureK),
            polarisations: Number(configuration.polarisations),
            sourceLabel: savedDate ? "Saved locally on " + savedDate : "Saved locally",
            sourceUrl: "",
            savedOn: savedDate,
            lastVerified: "",
            notes: "User-supplied values stored only in this browser.",
            isCustom: true
        };
    }

    function createLocalId() {
        if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
            return "custom-" + globalThis.crypto.randomUUID();
        }
        return "custom-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    }

    function initialiseApp() {
        const dom = {
            form: byId("snr-form"),
            storageNotice: byId("storage-notice"),
            telescopeSelect: byId("telescope-select"),
            telescopeSummary: byId("telescope-summary"),
            resetTelescope: byId("reset-telescope"),
            saveCustomTelescope: byId("save-custom-telescope"),
            deleteCustomTelescope: byId("delete-custom-telescope"),
            customPanel: byId("custom-telescope-panel"),
            customName: byId("custom-telescope-name"),
            customError: byId("custom-telescope-error"),
            confirmSaveCustom: byId("confirm-save-custom"),
            cancelSaveCustom: byId("cancel-save-custom"),
            openValuesTelescope: byId("open-values-telescope"),
            openValuesPulsar: byId("open-values-pulsar"),
            telescopeDialog: byId("telescope-values-dialog"),
            pulsarDialog: byId("pulsar-values-dialog"),
            closeTelescopeDialog: byId("close-telescope-dialog"),
            closePulsarDialog: byId("close-pulsar-dialog"),
            cancelTelescopeValues: byId("cancel-telescope-values"),
            cancelPulsarValues: byId("cancel-pulsar-values"),
            applyTelescopeValues: byId("apply-telescope-values"),
            applyPulsarValues: byId("apply-pulsar-values"),
            telescopeDialogStatus: byId("telescope-dialog-status"),
            pulsarDialogStatus: byId("pulsar-dialog-status"),
            pulsarSearch: byId("pulsar-search"),
            pulsarSearchHelp: byId("pulsar-search-help"),
            pulsarSuggestions: byId("pulsar-suggestions"),
            pulsarSummary: byId("pulsar-summary"),
            manualPulsar: byId("manual-pulsar"),
            fluxMeasurement: byId("flux-measurement"),
            overrideCount: byId("override-count"),
            instrumentSourceBadge: byId("instrument-source-badge"),
            pulsarSourceBadge: byId("pulsar-source-badge"),
            telescopeProvenance: byId("telescope-provenance"),
            pulsarProvenance: byId("pulsar-provenance"),
            formStatus: byId("form-status"),
            resultAnnouncement: byId("result-announcement"),
            resultValue: byId("result-value"),
            resultContext: byId("result-context"),
            resultWarnings: byId("result-warnings"),
            resultWarningList: byId("result-warning-list"),
            resultDetails: byId("result-details"),
            resultSummary: byId("result-summary"),
            telescopeSourceList: byId("telescope-source-list"),
            catalogueDisclosure: byId("catalogue-disclosure"),
            catalogueAcknowledgement: byId("catalogue-acknowledgement"),
            catalogueLicense: byId("catalogue-license"),
            fields: {
                area: byId("area"),
                efficiency: byId("efficiency"),
                centreFrequency: byId("centre-frequency"),
                bandwidth: byId("bandwidth"),
                tsys: byId("tsys"),
                polarisations: byId("polarisations"),
                period: byId("period"),
                width: byId("width"),
                flux: byId("flux"),
                fluxFrequency: byId("flux-frequency"),
                time: byId("time")
            }
        };

        if (!dom.form) {
            return;
        }

        const state = {
            customTelescopes: [],
            preferences: {},
            selectedTelescope: null,
            telescopeBaseline: null,
            selectedPulsar: null,
            pulsarBaseline: null,
            suggestions: [],
            activeSuggestionIndex: -1,
            storageWarnings: [],
            deleteArmed: false,
            deleteTimer: null,
            resultIsCurrent: false,
            dialogTransaction: null,
            committedTelescopeSelectValue: ""
        };

        function addStorageWarning(message) {
            if (state.storageWarnings.indexOf(message) === -1) {
                state.storageWarnings.push(message);
            }
            dom.storageNotice.textContent = state.storageWarnings.join(" ");
            dom.storageNotice.hidden = false;
        }

        function readStorage(key, fallbackValue, label) {
            try {
                const raw = window.localStorage.getItem(key);
                if (raw === null) {
                    return fallbackValue;
                }
                return JSON.parse(raw);
            } catch (error) {
                addStorageWarning(label + " could not be read. SNRCalc recovered with safe defaults.");
                return fallbackValue;
            }
        }

        function writeStorage(key, value, label) {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                addStorageWarning(label + " could not be saved. The current session still works, but changes may be lost.");
                return false;
            }
        }

        function loadStoredState() {
            const rawCustom = readStorage(STORAGE_KEYS.customTelescopes, [], "Custom telescope presets");
            if (!Array.isArray(rawCustom)) {
                addStorageWarning("Stored custom telescope data had an unexpected format and was ignored.");
                state.customTelescopes = [];
            } else {
                const seenIds = new Set();
                state.customTelescopes = rawCustom.filter(function (configuration) {
                    if (!isValidCustomConfiguration(configuration) || seenIds.has(configuration.id)) {
                        return false;
                    }
                    seenIds.add(configuration.id);
                    return true;
                }).slice(0, MAX_CUSTOM_TELESCOPES).map(normaliseCustomConfiguration);

                if (state.customTelescopes.length !== rawCustom.length) {
                    addStorageWarning("One or more invalid custom telescope presets were ignored.");
                }
            }

            const rawPreferences = readStorage(STORAGE_KEYS.preferences, {}, "Preferences");
            state.preferences = rawPreferences && typeof rawPreferences === "object" && !Array.isArray(rawPreferences)
                ? rawPreferences
                : {};
        }

        function savePreferences() {
            writeStorage(STORAGE_KEYS.preferences, state.preferences, "Preferences");
        }

        function allTelescopes() {
            return BUILT_IN_TELESCOPES.concat(state.customTelescopes);
        }

        function findTelescope(id) {
            return allTelescopes().find(function (configuration) {
                return configuration.id === id;
            }) || null;
        }

        function renderTelescopeOptions(selectedId) {
            const placeholderOption = createOption("", "Select telescope / receiver");
            placeholderOption.disabled = true;
            const manualOption = createOption("manual", "Custom telescope");

            dom.telescopeSelect.replaceChildren(placeholderOption);
            BUILT_IN_TELESCOPES.forEach(function (configuration) {
                dom.telescopeSelect.appendChild(createOption(configuration.id, configurationLabel(configuration)));
            });

            state.customTelescopes.forEach(function (configuration) {
                dom.telescopeSelect.appendChild(createOption(configuration.id, configurationLabel(configuration)));
            });

            dom.telescopeSelect.appendChild(manualOption);

            dom.telescopeSelect.value = findTelescope(selectedId)
                ? selectedId
                : selectedId === "manual" ? "manual" : "";
        }

        function setSelectionSummary(container, title) {
            const strong = document.createElement("span");
            strong.className = "selection-title";
            strong.textContent = title;
            container.replaceChildren(strong);
        }

        function showNoTelescopeSelection() {
            dom.telescopeSelect.value = "";
            setSelectionSummary(
                dom.telescopeSummary,
                "No telescope selected"
            );
        }

        function setInputValue(uiKey, value) {
            if (value === null || value === undefined) {
                dom.fields[uiKey].value = "";
                return;
            }
            if (typeof value === "number" && Number.isFinite(value)) {
                dom.fields[uiKey].value = String(Number(value.toPrecision(16)));
                return;
            }
            dom.fields[uiKey].value = String(value);
        }

        function clearFieldError(uiKey) {
            const input = dom.fields[uiKey];
            if (!input) {
                return;
            }
            input.removeAttribute("aria-invalid");
            const errorElement = byId(uiKey + "-error");
            if (errorElement) {
                errorElement.textContent = "";
            }
        }

        function setFieldError(uiKey, message) {
            const input = dom.fields[uiKey];
            if (!input) {
                return;
            }
            input.setAttribute("aria-invalid", "true");
            const errorElement = byId(uiKey + "-error");
            if (errorElement) {
                errorElement.textContent = message;
            }
        }

        function clearAllErrors() {
            Object.keys(dom.fields).forEach(clearFieldError);
            clearFormStatus();
        }

        function clearFormStatus() {
            dom.formStatus.hidden = true;
            dom.formStatus.textContent = "";
        }

        function setFieldMissing(uiKey, missing) {
            const input = dom.fields[uiKey];
            const wrapper = input ? input.closest(".field-control") : null;
            if (wrapper) {
                wrapper.classList.toggle("is-missing", Boolean(missing));
            }
        }

        function baselineDiffers(uiKey, baseline) {
            if (!baseline || !Object.prototype.hasOwnProperty.call(baseline, uiKey)) {
                return false;
            }

            const current = dom.fields[uiKey].value.trim();
            const original = baseline[uiKey];
            if (original === null || original === undefined) {
                return current !== "";
            }
            if (current === "") {
                return true;
            }
            const currentNumber = Number(current);
            const originalNumber = Number(original);
            const tolerance = Number.EPSILON * 8 * Math.max(
                1,
                Math.abs(currentNumber),
                Math.abs(originalNumber)
            );
            return Math.abs(currentNumber - originalNumber) > tolerance;
        }

        function updateOverrideStates() {
            let count = 0;

            TELESCOPE_UI_KEYS.forEach(function (uiKey) {
                const overridden = baselineDiffers(uiKey, state.telescopeBaseline);
                const wrapper = dom.fields[uiKey].closest(".field-control");
                const indicator = byId(uiKey + "-override");
                wrapper.classList.toggle("is-overridden", overridden);
                if (indicator) {
                    indicator.hidden = !overridden;
                }
                if (overridden) {
                    count += 1;
                }
            });

            PULSAR_UI_KEYS.forEach(function (uiKey) {
                const overridden = baselineDiffers(uiKey, state.pulsarBaseline);
                const wrapper = dom.fields[uiKey].closest(".field-control");
                const indicator = byId(uiKey + "-override");
                wrapper.classList.toggle("is-overridden", overridden);
                if (indicator) {
                    indicator.hidden = !overridden;
                }
                if (overridden) {
                    count += 1;
                }
            });

            dom.overrideCount.textContent = count ? count + (count === 1 ? " override" : " overrides") : "";
            dom.overrideCount.hidden = count === 0;
            dom.overrideCount.classList.toggle("has-overrides", count > 0);
        }

        function telescopeBaselineFrom(configuration) {
            return {
                area: configuration.collectingAreaM2,
                efficiency: configuration.efficiencyPercent,
                centreFrequency: configuration.centreFrequencyMHz,
                bandwidth: configuration.bandwidthMHz,
                tsys: configuration.systemTemperatureK,
                polarisations: configuration.polarisations
            };
        }

        function fillTelescopeValues(configuration) {
            setInputValue("area", configuration.collectingAreaM2);
            setInputValue("efficiency", configuration.efficiencyPercent);
            setInputValue("centreFrequency", configuration.centreFrequencyMHz);
            setInputValue("bandwidth", configuration.bandwidthMHz);
            setInputValue("tsys", configuration.systemTemperatureK);
            setInputValue("polarisations", configuration.polarisations);
            TELESCOPE_UI_KEYS.forEach(function (key) {
                setFieldMissing(key, false);
                clearFieldError(key);
            });
        }

        function telescopeSources(configuration) {
            const sources = [];
            if (configuration.sourceLabel || configuration.sourceUrl) {
                sources.push({
                    label: configuration.sourceLabel || "Published source",
                    url: configuration.sourceUrl || ""
                });
            }
            if (Array.isArray(configuration.additionalSources)) {
                configuration.additionalSources.forEach(function (source) {
                    if (source && typeof source.label === "string" && typeof source.url === "string") {
                        sources.push(source);
                    }
                });
            }
            return sources;
        }

        function appendTelescopeSourceLinks(container, configuration) {
            telescopeSources(configuration).forEach(function (source, index) {
                if (index > 0) {
                    container.appendChild(document.createTextNode("; "));
                }
                if (source.url) {
                    const link = document.createElement("a");
                    link.href = source.url;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.textContent = source.label;
                    container.appendChild(link);
                } else {
                    container.appendChild(document.createTextNode(source.label));
                }
            });
        }

        function setTelescopeProvenance(configuration) {
            dom.telescopeProvenance.replaceChildren();
            if (!configuration) {
                dom.telescopeProvenance.hidden = true;
                return;
            }
            dom.telescopeProvenance.hidden = false;

            if (configuration.isCustom) {
                dom.telescopeProvenance.textContent = "Saved in this browser" +
                    (configuration.savedOn ? " on " + configuration.savedOn : "") + ".";
                return;
            }

            dom.telescopeProvenance.appendChild(document.createTextNode("Sources: "));
            appendTelescopeSourceLinks(dom.telescopeProvenance, configuration);

            const suffix = configuration.lastVerified ? ". Verified " + configuration.lastVerified + "." : ".";
            dom.telescopeProvenance.appendChild(document.createTextNode(suffix));
        }

        function resetDeleteButton() {
            state.deleteArmed = false;
            dom.deleteCustomTelescope.textContent = "Delete custom preset";
            if (state.deleteTimer) {
                window.clearTimeout(state.deleteTimer);
                state.deleteTimer = null;
            }
        }

        function applyTelescope(id, options) {
            const settings = options || {};
            const configuration = findTelescope(id);
            invalidateResult();
            clearFormStatus();
            resetDeleteButton();
            dom.customPanel.hidden = true;
            dom.customError.textContent = "";

            if (!configuration) {
                state.selectedTelescope = null;
                state.telescopeBaseline = null;
                dom.telescopeSelect.value = "manual";

                if (settings.clear !== false) {
                    TELESCOPE_UI_KEYS.forEach(function (key) {
                        setInputValue(key, null);
                        setFieldMissing(key, false);
                        clearFieldError(key);
                    });
                }

                setSelectionSummary(
                    dom.telescopeSummary,
                    "Custom telescope"
                );
                dom.instrumentSourceBadge.textContent = "Manual";
                dom.resetTelescope.disabled = true;
                dom.resetTelescope.hidden = true;
                dom.deleteCustomTelescope.hidden = true;
                setTelescopeProvenance(null);
                state.preferences.selectedTelescopeId = "manual";
            } else {
                state.selectedTelescope = configuration;
                state.telescopeBaseline = telescopeBaselineFrom(configuration);
                dom.telescopeSelect.value = configuration.id;
                fillTelescopeValues(configuration);
                setSelectionSummary(
                    dom.telescopeSummary,
                    configurationLabel(configuration)
                );
                dom.instrumentSourceBadge.textContent = configuration.isCustom ? "Custom" : "Published";
                dom.resetTelescope.disabled = false;
                dom.resetTelescope.hidden = false;
                dom.resetTelescope.textContent = configuration.isCustom ? "Reset saved preset" : "Reset preset";
                dom.deleteCustomTelescope.hidden = !configuration.isCustom;
                setTelescopeProvenance(configuration);
                state.preferences.selectedTelescopeId = configuration.id;
            }

            if (settings.savePreference !== false) {
                savePreferences();
            }

            if (
                state.selectedPulsar &&
                dom.fluxMeasurement.value !== "manual" &&
                !baselineDiffers("flux", state.pulsarBaseline) &&
                !baselineDiffers("fluxFrequency", state.pulsarBaseline)
            ) {
                populateFluxMeasurements(state.selectedPulsar);
            }

            updateOverrideStates();
        }

        function copyBaseline(baseline) {
            return baseline ? Object.assign({}, baseline) : null;
        }

        function captureFieldValues() {
            const values = {};
            Object.keys(dom.fields).forEach(function (uiKey) {
                values[uiKey] = dom.fields[uiKey].value;
            });
            return values;
        }

        function restoreFieldValues(values) {
            Object.keys(values).forEach(function (uiKey) {
                setInputValue(uiKey, values[uiKey]);
                clearFieldError(uiKey);
                if (PULSAR_UI_KEYS.indexOf(uiKey) !== -1) {
                    setFieldMissing(uiKey, values[uiKey] === "");
                }
            });
        }

        function beginDialogTransaction(type, origin) {
            if (state.dialogTransaction) {
                return;
            }

            state.dialogTransaction = {
                type: type,
                origin: origin || document.activeElement,
                values: captureFieldValues(),
                selectedTelescopeId: state.selectedTelescope ? state.selectedTelescope.id : null,
                telescopeBaseline: copyBaseline(state.telescopeBaseline),
                selectedPulsarIndex: state.selectedPulsar ? state.selectedPulsar.index : null,
                hadSelectedPulsar: Boolean(state.selectedPulsar),
                pulsarBaseline: copyBaseline(state.pulsarBaseline),
                pulsarSearch: dom.pulsarSearch.value,
                fluxMeasurement: dom.fluxMeasurement.value,
                preferredTelescopeId: state.preferences.selectedTelescopeId || "manual",
                committedTelescopeSelectValue: state.committedTelescopeSelectValue
            };
        }

        function clearDialogStatus(type) {
            const status = type === "telescope" ? dom.telescopeDialogStatus : dom.pulsarDialogStatus;
            status.hidden = true;
            status.textContent = "";
        }

        function clearGroupErrors(type) {
            const keys = type === "telescope" ? TELESCOPE_UI_KEYS : PULSAR_UI_KEYS;
            keys.forEach(clearFieldError);
            clearDialogStatus(type);
        }

        function restoreDialogTransaction() {
            const transaction = state.dialogTransaction;
            if (!transaction) {
                return null;
            }

            if (transaction.type === "telescope") {
                applyTelescope(transaction.selectedTelescopeId || "manual", { savePreference: false });
                state.telescopeBaseline = copyBaseline(transaction.telescopeBaseline);
                state.preferences.selectedTelescopeId = transaction.preferredTelescopeId;
                state.committedTelescopeSelectValue = transaction.committedTelescopeSelectValue;
                if (transaction.committedTelescopeSelectValue === "") {
                    showNoTelescopeSelection();
                } else {
                    dom.telescopeSelect.value = transaction.committedTelescopeSelectValue;
                }
            } else if (transaction.hadSelectedPulsar) {
                selectPulsar(transaction.selectedPulsarIndex, { openMissingValues: false });
                state.pulsarBaseline = copyBaseline(transaction.pulsarBaseline);
            } else {
                clearPulsarSelection(true);
                state.pulsarBaseline = copyBaseline(transaction.pulsarBaseline);
            }

            restoreFieldValues(transaction.values);
            dom.pulsarSearch.value = transaction.pulsarSearch;
            if (Array.from(dom.fluxMeasurement.options).some(function (option) {
                return option.value === transaction.fluxMeasurement;
            })) {
                dom.fluxMeasurement.value = transaction.fluxMeasurement;
            }
            updateOverrideStates();
            return transaction;
        }

        function focusAfterDialog(origin) {
            if (origin && typeof origin.focus === "function" && document.contains(origin)) {
                origin.focus();
            }
        }

        function cancelDialog(type) {
            if (!state.dialogTransaction || state.dialogTransaction.type !== type) {
                return;
            }
            const dialog = type === "telescope" ? dom.telescopeDialog : dom.pulsarDialog;
            const transaction = restoreDialogTransaction();
            state.dialogTransaction = null;
            clearGroupErrors(type);
            clearFormStatus();
            if (dialog.open) {
                dialog.close("cancel");
            }
            focusAfterDialog(transaction.origin);
        }

        function finishDialog(type, focusTarget) {
            const dialog = type === "telescope" ? dom.telescopeDialog : dom.pulsarDialog;
            const transaction = state.dialogTransaction;
            state.dialogTransaction = null;
            clearDialogStatus(type);
            if (dialog.open) {
                dialog.close("apply");
            }
            invalidateResult();
            updateOverrideStates();
            focusAfterDialog(focusTarget || (transaction && transaction.origin));
        }

        function openValueDialog(type, focusKey, origin) {
            const dialog = type === "telescope" ? dom.telescopeDialog : dom.pulsarDialog;
            if (!state.dialogTransaction) {
                beginDialogTransaction(type, origin);
            }
            clearDialogStatus(type);
            if (!dialog.open) {
                dialog.showModal();
            }
            const target = dom.fields[focusKey];
            if (target) {
                target.focus();
            }
        }

        function readPulsarDraft() {
            return {
                periodSeconds: dom.fields.period.value,
                widthSeconds: dom.fields.width.value,
                fluxJy: dom.fields.flux.value,
                fluxFrequencyMHz: dom.fields.fluxFrequency.value
            };
        }

        function validatePulsarDraft(rawPulsar) {
            const completeDraft = Object.assign({}, rawPulsar, {
                collectingAreaM2: 1,
                efficiencyPercent: 100,
                centreFrequencyMHz: 1400,
                bandwidthMHz: 1,
                systemTemperatureK: 1,
                polarisations: 1,
                integrationTimeSeconds: 1
            });
            const validation = validateCalculationInputs(completeDraft);
            const errors = {};
            ["periodSeconds", "widthSeconds", "fluxJy", "fluxFrequencyMHz"].forEach(function (key) {
                if (validation.errors[key]) {
                    errors[key] = validation.errors[key];
                }
            });
            return {
                valid: Object.keys(errors).length === 0,
                values: validation.values,
                errors: errors
            };
        }

        function showDialogValidationErrors(type, validation) {
            clearGroupErrors(type);
            let firstInvalid = null;
            Object.keys(validation.errors).forEach(function (canonicalKey) {
                const meta = FIELD_META[canonicalKey];
                if (!meta) {
                    return;
                }
                setFieldError(meta.ui, validation.errors[canonicalKey]);
                if (!firstInvalid) {
                    firstInvalid = dom.fields[meta.ui];
                }
            });

            const errorCount = Object.keys(validation.errors).length;
            const status = type === "telescope" ? dom.telescopeDialogStatus : dom.pulsarDialogStatus;
            status.textContent = "Correct " + errorCount + (errorCount === 1 ? " field" : " fields") + " before applying these values.";
            status.hidden = false;
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }

        function applyTelescopeDialog() {
            const validation = validateInstrumentDraft(readInstrumentDraft());
            if (!validation.valid) {
                showDialogValidationErrors("telescope", validation);
                return;
            }

            clearGroupErrors("telescope");
            clearFormStatus();
            if (!state.selectedTelescope) {
                state.preferences.selectedTelescopeId = "manual";
                state.committedTelescopeSelectValue = "manual";
                dom.telescopeSelect.value = "manual";
                savePreferences();
                setSelectionSummary(
                    dom.telescopeSummary,
                    "Custom telescope"
                );
            } else {
                setSelectionSummary(
                    dom.telescopeSummary,
                    configurationLabel(state.selectedTelescope)
                );
            }
            dom.customPanel.hidden = true;
            finishDialog("telescope");
        }

        function applyPulsarDialog() {
            const validation = validatePulsarDraft(readPulsarDraft());
            if (!validation.valid) {
                showDialogValidationErrors("pulsar", validation);
                return;
            }

            clearGroupErrors("pulsar");
            clearFormStatus();
            if (state.selectedPulsar) {
                setSelectionSummary(
                    dom.pulsarSummary,
                    state.selectedPulsar.jName + (state.selectedPulsar.bName ? " / " + state.selectedPulsar.bName : "")
                );
            } else {
                setSelectionSummary(
                    dom.pulsarSummary,
                    "Custom pulsar"
                );
            }
            finishDialog("pulsar");
        }

        function readInstrumentDraft() {
            return {
                collectingAreaM2: dom.fields.area.value,
                efficiencyPercent: dom.fields.efficiency.value,
                centreFrequencyMHz: dom.fields.centreFrequency.value,
                bandwidthMHz: dom.fields.bandwidth.value,
                systemTemperatureK: dom.fields.tsys.value,
                polarisations: dom.fields.polarisations.value
            };
        }

        function validateInstrumentDraft(rawInstrument) {
            const completeDraft = Object.assign({}, rawInstrument, {
                fluxJy: 1,
                integrationTimeSeconds: 1,
                periodSeconds: 2,
                widthSeconds: 1,
                fluxFrequencyMHz: 1400
            });
            const validation = validateCalculationInputs(completeDraft);
            const errors = {};
            INSTRUMENT_KEYS.forEach(function (key) {
                if (validation.errors[key]) {
                    errors[key] = validation.errors[key];
                }
            });
            return {
                valid: Object.keys(errors).length === 0,
                values: validation.values,
                errors: errors
            };
        }

        function showValidationErrors(validation) {
            clearAllErrors();
            let firstInvalid = null;

            Object.keys(validation.errors).forEach(function (canonicalKey) {
                const meta = FIELD_META[canonicalKey];
                if (!meta) {
                    return;
                }
                setFieldError(meta.ui, validation.errors[canonicalKey]);
                if (!firstInvalid) {
                    firstInvalid = dom.fields[meta.ui];
                }
            });

            const errorCount = Object.keys(validation.errors).length;
            dom.formStatus.textContent = "Please correct " + errorCount + (errorCount === 1 ? " field" : " fields") + " before calculating.";
            dom.formStatus.hidden = false;

            if (firstInvalid) {
                if (firstInvalid === dom.fields.time) {
                    firstInvalid.focus();
                } else if (TELESCOPE_UI_KEYS.indexOf(FIELD_META[Object.keys(validation.errors)[0]].ui) !== -1) {
                    openValueDialog("telescope", FIELD_META[Object.keys(validation.errors)[0]].ui, dom.openValuesTelescope);
                    dom.telescopeDialogStatus.textContent = dom.formStatus.textContent;
                    dom.telescopeDialogStatus.hidden = false;
                } else {
                    openValueDialog("pulsar", FIELD_META[Object.keys(validation.errors)[0]].ui, dom.openValuesPulsar);
                    dom.pulsarDialogStatus.textContent = dom.formStatus.textContent;
                    dom.pulsarDialogStatus.hidden = false;
                }
            }
        }

        function saveCustomTelescope() {
            dom.customError.textContent = "";
            const name = dom.customName.value.trim();
            if (!name) {
                dom.customError.textContent = "Enter a name for this custom preset.";
                dom.customName.focus();
                return;
            }

            if (state.customTelescopes.length >= MAX_CUSTOM_TELESCOPES) {
                dom.customError.textContent = "You can save up to " + MAX_CUSTOM_TELESCOPES + " custom telescope presets. Delete one before saving another.";
                return;
            }

            const validation = validateInstrumentDraft(readInstrumentDraft());
            if (!validation.valid) {
                showDialogValidationErrors("telescope", validation);
                dom.customError.textContent = "Complete the instrument values before saving this preset.";
                return;
            }

            const values = validation.values;
            const today = new Date().toISOString().slice(0, 10);
            const custom = {
                id: createLocalId(),
                telescopeName: name,
                configurationName: "Custom configuration",
                collectingAreaM2: values.collectingAreaM2,
                efficiencyPercent: values.efficiencyPercent,
                centreFrequencyMHz: values.centreFrequencyMHz,
                bandwidthMHz: values.bandwidthMHz,
                systemTemperatureK: values.systemTemperatureK,
                polarisations: values.polarisations,
                sourceLabel: "Saved locally on " + today,
                sourceUrl: "",
                savedOn: today,
                lastVerified: "",
                notes: "User-supplied values stored only in this browser.",
                isCustom: true
            };

            state.customTelescopes.push(custom);
            writeStorage(STORAGE_KEYS.customTelescopes, state.customTelescopes, "Custom telescope presets");
            renderTelescopeOptions(custom.id);
            applyTelescope(custom.id);
            state.committedTelescopeSelectValue = custom.id;
            dom.customName.value = "";
            dom.customPanel.hidden = true;
            finishDialog("telescope", dom.telescopeSelect);
        }

        function deleteSelectedCustomTelescope() {
            const configuration = state.selectedTelescope;
            if (!configuration || !configuration.isCustom) {
                return;
            }

            if (!state.deleteArmed) {
                state.deleteArmed = true;
                dom.deleteCustomTelescope.textContent = "Confirm delete";
                state.deleteTimer = window.setTimeout(resetDeleteButton, 5000);
                return;
            }

            state.customTelescopes = state.customTelescopes.filter(function (item) {
                return item.id !== configuration.id;
            });
            writeStorage(STORAGE_KEYS.customTelescopes, state.customTelescopes, "Custom telescope presets");
            renderTelescopeOptions("");
            applyTelescope("manual", { savePreference: false });
            state.committedTelescopeSelectValue = "";
            showNoTelescopeSelection();
            state.preferences.selectedTelescopeId = "manual";
            savePreferences();
            finishDialog("telescope", dom.telescopeSelect);
        }

        function availableFluxMeasurements(entry) {
            return ["400", "1400", "2000"].filter(function (frequency) {
                return entry.fluxMilliJy[frequency] !== null;
            }).map(function (frequency) {
                return {
                    frequencyMHz: Number(frequency),
                    milliJy: Number(entry.fluxMilliJy[frequency])
                };
            });
        }

        function chooseClosestFlux(measurements) {
            if (!measurements.length) {
                return null;
            }
            const centreFrequency = Number(dom.fields.centreFrequency.value);
            if (!Number.isFinite(centreFrequency) || centreFrequency <= 0) {
                return measurements.find(function (measurement) {
                    return measurement.frequencyMHz === 1400;
                }) || measurements[0];
            }

            return measurements.slice().sort(function (left, right) {
                const leftDistance = Math.abs(Math.log(left.frequencyMHz / centreFrequency));
                const rightDistance = Math.abs(Math.log(right.frequencyMHz / centreFrequency));
                return leftDistance - rightDistance;
            })[0];
        }

        function applyFluxMeasurement(measurement) {
            if (!state.pulsarBaseline) {
                return;
            }

            invalidateResult();
            clearFormStatus();
            if (!measurement) {
                dom.fluxMeasurement.value = "manual";
                setInputValue("flux", null);
                setInputValue("fluxFrequency", null);
                state.pulsarBaseline.flux = null;
                state.pulsarBaseline.fluxFrequency = null;
                setFieldMissing("flux", true);
                setFieldMissing("fluxFrequency", true);
            } else {
                dom.fluxMeasurement.value = "catalogue-" + measurement.frequencyMHz;
                const fluxJy = milliJyToJy(measurement.milliJy);
                setInputValue("flux", fluxJy);
                setInputValue("fluxFrequency", measurement.frequencyMHz);
                state.pulsarBaseline.flux = fluxJy;
                state.pulsarBaseline.fluxFrequency = measurement.frequencyMHz;
                setFieldMissing("flux", false);
                setFieldMissing("fluxFrequency", false);
                clearFieldError("flux");
                clearFieldError("fluxFrequency");
            }
            updateOverrideStates();
        }

        function populateFluxMeasurements(entry) {
            const measurements = availableFluxMeasurements(entry);
            const options = measurements.map(function (measurement) {
                return createOption(
                    "catalogue-" + measurement.frequencyMHz,
                    measurement.frequencyMHz + " MHz — " + formatSignificant(measurement.milliJy, 4) + " mJy (ATNF)"
                );
            });
            options.push(createOption("manual", "Manual flux density"));
            dom.fluxMeasurement.replaceChildren.apply(dom.fluxMeasurement, options);
            applyFluxMeasurement(chooseClosestFlux(measurements));
        }

        function setPulsarProvenance(entry) {
            dom.pulsarProvenance.replaceChildren();
            if (!entry) {
                dom.pulsarProvenance.hidden = true;
                return;
            }
            dom.pulsarProvenance.hidden = false;

            dom.pulsarProvenance.appendChild(document.createTextNode("Source: "));
            const link = document.createElement("a");
            link.href = PULSAR_CATALOGUE.sourceUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = PULSAR_CATALOGUE.source + " v" + PULSAR_CATALOGUE.version;
            dom.pulsarProvenance.appendChild(link);
            dom.pulsarProvenance.appendChild(document.createTextNode(
                ". W50 depends on frequency and resolution; flux is not spectrally scaled."
            ));
        }

        function closeSuggestions() {
            state.suggestions = [];
            state.activeSuggestionIndex = -1;
            dom.pulsarSuggestions.hidden = true;
            dom.pulsarSearch.setAttribute("aria-expanded", "false");
            dom.pulsarSearch.removeAttribute("aria-activedescendant");
        }

        function renderSuggestionActiveState() {
            const optionElements = dom.pulsarSuggestions.querySelectorAll(".suggestion-option");
            optionElements.forEach(function (option, index) {
                const active = index === state.activeSuggestionIndex;
                option.classList.toggle("is-active", active);
                option.setAttribute("aria-selected", active ? "true" : "false");
            });

            if (state.activeSuggestionIndex >= 0 && optionElements[state.activeSuggestionIndex]) {
                const activeOption = optionElements[state.activeSuggestionIndex];
                dom.pulsarSearch.setAttribute("aria-activedescendant", activeOption.id);
                activeOption.scrollIntoView({ block: "nearest" });
            } else {
                dom.pulsarSearch.removeAttribute("aria-activedescendant");
            }
        }

        function renderSuggestions(matches) {
            state.suggestions = matches;
            state.activeSuggestionIndex = -1;
            dom.pulsarSearch.removeAttribute("aria-activedescendant");
            const fragment = document.createDocumentFragment();

            matches.forEach(function (entry, index) {
                const listItem = document.createElement("li");
                const option = document.createElement("button");
                const names = document.createElement("span");
                const completeness = document.createElement("small");

                option.type = "button";
                option.tabIndex = -1;
                option.className = "suggestion-option";
                option.id = "pulsar-option-" + index;
                option.setAttribute("role", "option");
                option.setAttribute("aria-selected", "false");
                option.dataset.catalogueIndex = String(entry.index);
                listItem.setAttribute("role", "presentation");
                names.textContent = entry.jName + (entry.bName ? " / " + entry.bName : "");

                const missingCount = [
                    entry.periodSeconds,
                    entry.width50Milliseconds,
                    availableFluxMeasurements(entry).length ? 1 : null
                ].filter(function (value) {
                    return value === null;
                }).length;
                completeness.textContent = missingCount ? missingCount + " required value" + (missingCount === 1 ? " missing" : "s missing") : "Complete for calculation";

                option.append(names, completeness);
                listItem.appendChild(option);
                fragment.appendChild(listItem);
            });

            dom.pulsarSuggestions.replaceChildren(fragment);
            dom.pulsarSuggestions.hidden = matches.length === 0;
            dom.pulsarSearch.setAttribute("aria-expanded", matches.length ? "true" : "false");
            dom.pulsarSearchHelp.textContent = matches.length
                ? matches.length + " match" + (matches.length === 1 ? "" : "es") + ". Use arrow keys and Enter."
                : "No matches. Use Custom pulsar.";
        }

        function clearPulsarSelection(clearSearch) {
            invalidateResult();
            clearFormStatus();
            state.selectedPulsar = null;
            state.pulsarBaseline = null;
            if (clearSearch !== false) {
                dom.pulsarSearch.value = "";
            }
            setInputValue("period", null);
            setInputValue("width", null);
            setInputValue("flux", null);
            setInputValue("fluxFrequency", null);
            dom.fluxMeasurement.replaceChildren(createOption("manual", "Manual flux density"));
            ["period", "width", "flux", "fluxFrequency"].forEach(function (key) {
                setFieldMissing(key, false);
                clearFieldError(key);
            });
            dom.pulsarSourceBadge.textContent = "Manual";
            setSelectionSummary(
                dom.pulsarSummary,
                "Custom pulsar"
            );
            setPulsarProvenance(null);
            dom.pulsarSearchHelp.textContent = PULSAR_CATALOGUE.mode === "embedded-snapshot"
                ? "Type 2+ characters."
                : "Manual pulsar entry is active.";
            closeSuggestions();
            updateOverrideStates();
        }

        function selectPulsar(index, options) {
            const row = PULSAR_ROWS[index];
            if (!row) {
                return;
            }
            const settings = options || {};
            const entry = pulsarEntryFromRow(row, index);
            const requiresManualValues = entry.periodSeconds === null ||
                entry.width50Milliseconds === null ||
                !availableFluxMeasurements(entry).length;
            if (requiresManualValues && settings.openMissingValues !== false && !state.dialogTransaction) {
                beginDialogTransaction("pulsar", document.activeElement);
            }
            invalidateResult();
            clearFormStatus();
            state.selectedPulsar = entry;
            dom.pulsarSearch.value = entry.jName + (entry.bName ? " / " + entry.bName : "");
            dom.pulsarSearchHelp.textContent = "Selected. Search again to change.";

            const period = entry.periodSeconds;
            const width = entry.width50Milliseconds === null
                ? null
                : millisecondsToSeconds(entry.width50Milliseconds);

            setInputValue("period", period);
            setInputValue("width", width);
            setFieldMissing("period", period === null);
            setFieldMissing("width", width === null);
            clearFieldError("period");
            clearFieldError("width");

            state.pulsarBaseline = {
                period: period,
                width: width,
                flux: null,
                fluxFrequency: null
            };
            populateFluxMeasurements(entry);

            const missing = [];
            if (period === null) {
                missing.push("period");
            }
            if (width === null) {
                missing.push("W50");
            }
            if (!availableFluxMeasurements(entry).length) {
                missing.push("supported flux");
            }

            dom.pulsarSourceBadge.textContent = "ATNF v" + PULSAR_CATALOGUE.version;
            setSelectionSummary(
                dom.pulsarSummary,
                entry.jName + (entry.bName ? " / " + entry.bName : "")
            );
            setPulsarProvenance(entry);
            closeSuggestions();
            if (missing.length && settings.openMissingValues !== false) {
                openValueDialog("pulsar", PULSAR_UI_KEYS.find(function (uiKey) {
                    return dom.fields[uiKey].value === "";
                }) || "period", document.activeElement);
            }
            updateOverrideStates();
        }

        function readCalculationInput() {
            return {
                collectingAreaM2: dom.fields.area.value,
                efficiencyPercent: dom.fields.efficiency.value,
                centreFrequencyMHz: dom.fields.centreFrequency.value,
                bandwidthMHz: dom.fields.bandwidth.value,
                systemTemperatureK: dom.fields.tsys.value,
                polarisations: dom.fields.polarisations.value,
                fluxJy: dom.fields.flux.value,
                integrationTimeSeconds: dom.fields.time.value,
                periodSeconds: dom.fields.period.value,
                widthSeconds: dom.fields.width.value,
                fluxFrequencyMHz: dom.fields.fluxFrequency.value
            };
        }

        function overrideLabels() {
            const labels = [];
            TELESCOPE_UI_KEYS.forEach(function (uiKey) {
                if (baselineDiffers(uiKey, state.telescopeBaseline)) {
                    labels.push(UI_LABELS[uiKey]);
                }
            });
            PULSAR_UI_KEYS.forEach(function (uiKey) {
                if (baselineDiffers(uiKey, state.pulsarBaseline)) {
                    labels.push(UI_LABELS[uiKey]);
                }
            });
            return labels;
        }

        function renderWarnings(values) {
            const warnings = [];
            const overrides = overrideLabels();

            if (!state.selectedTelescope) {
                warnings.push("Manual telescope values were used.");
            } else if (state.selectedTelescope.isCustom) {
                warnings.push("A locally saved custom telescope preset was used.");
            } else if (state.selectedTelescope.notes) {
                warnings.push("Preset caveat: " + state.selectedTelescope.notes);
            }

            if (!state.selectedPulsar) {
                warnings.push("Manual or unlisted pulsar values were used.");
            }

            if (overrides.length) {
                warnings.push("Manual overrides: " + overrides.join(", ") + ".");
            }

            if (Math.abs(values.centreFrequencyMHz - values.fluxFrequencyMHz) > 1e-9) {
                warnings.push(
                    "The flux density was measured at " + formatSignificant(values.fluxFrequencyMHz, 6) +
                    " MHz while the telescope reference frequency is " + formatSignificant(values.centreFrequencyMHz, 6) +
                    " MHz. No spectral-index scaling was applied."
                );
            }

            dom.resultWarningList.replaceChildren();
            warnings.forEach(function (warning) {
                const item = document.createElement("li");
                item.textContent = warning;
                dom.resultWarningList.appendChild(item);
            });
            dom.resultWarnings.open = false;
            dom.resultWarnings.hidden = warnings.length === 0;
            return warnings;
        }

        function renderResultSummary(details) {
            const values = details.values;
            const pairs = [
                ["Telescope", state.selectedTelescope ? configurationLabel(state.selectedTelescope) : "Manual / unlisted"],
                ["Pulsar", state.selectedPulsar ? state.selectedPulsar.jName : "Manual / unlisted"],
                ["Flux used", formatSignificant(values.fluxJy, 6) + " Jy @ " + formatSignificant(values.fluxFrequencyMHz, 6) + " MHz"],
                ["Area × efficiency", formatSignificant(values.collectingAreaM2, 6) + " m² × " + formatSignificant(values.efficiencyPercent, 6) + "%"],
                ["Gain", formatSignificant(details.gainKPerJy, 5) + " K/Jy"],
                ["Bandwidth", formatSignificant(values.bandwidthMHz, 6) + " MHz"],
                ["Total system temperature", formatSignificant(values.systemTemperatureK, 6) + " K"],
                ["Polarisations", String(values.polarisations)],
                ["Observing time", formatSignificant(values.integrationTimeSeconds, 6) + " s"],
                ["Period / width", formatSignificant(values.periodSeconds, 6) + " s / " + formatSignificant(values.widthSeconds, 6) + " s"]
            ];

            const fragment = document.createDocumentFragment();
            pairs.forEach(function (pair) {
                const term = document.createElement("dt");
                const description = document.createElement("dd");
                term.textContent = pair[0];
                description.textContent = pair[1];
                fragment.append(term, description);
            });
            dom.resultSummary.replaceChildren(fragment);
            dom.resultDetails.open = false;
            dom.resultDetails.hidden = false;
        }

        function clearResult(message, announce) {
            const context = message || "";
            state.resultIsCurrent = false;
            dom.resultValue.textContent = "—";
            dom.resultContext.textContent = context;
            dom.resultWarnings.hidden = true;
            dom.resultWarnings.open = false;
            dom.resultWarningList.replaceChildren();
            dom.resultDetails.hidden = true;
            dom.resultDetails.open = false;
            dom.resultSummary.replaceChildren();
            dom.resultAnnouncement.textContent = announce ? context : "";
        }

        function invalidateResult() {
            if (state.dialogTransaction) {
                return;
            }
            if (state.resultIsCurrent) {
                clearResult("Inputs changed. Calculate again to update the S/N.", true);
            }
        }

        function handleCalculation(event) {
            event.preventDefault();
            const validation = validateCalculationInputs(readCalculationInput());
            if (!validation.valid) {
                showValidationErrors(validation);
                clearResult("Calculation not completed. Correct the highlighted values and try again.");
                return;
            }

            clearAllErrors();
            try {
                const details = calculateSnrDetails(validation.values);
                const telescopeName = state.selectedTelescope
                    ? configurationLabel(state.selectedTelescope)
                    : "Manual telescope";
                const pulsarName = state.selectedPulsar
                    ? state.selectedPulsar.jName
                    : "Manual / unlisted pulsar";

                const formattedSnr = formatSignificant(details.snr, 3);
                const resultContext =
                    telescopeName + " / " + pulsarName + ". Flux: " +
                    formatSignificant(details.values.fluxJy, 6) + " Jy at " +
                    formatSignificant(details.values.fluxFrequencyMHz, 6) + " MHz.";
                dom.resultValue.textContent = formattedSnr;
                dom.resultContext.textContent = resultContext;
                const warnings = renderWarnings(details.values);
                renderResultSummary(details);
                state.resultIsCurrent = true;
                dom.resultAnnouncement.textContent =
                    "Calculated signal-to-noise ratio " + formattedSnr + ". " + resultContext +
                    (warnings.length ? " Warnings: " + warnings.join(" ") : " No calculation warnings.");
            } catch (error) {
                dom.formStatus.textContent = "The supplied values could not produce a finite, positive result. Review the inputs and try again.";
                dom.formStatus.hidden = false;
                clearResult("Calculation not completed.");
            }
        }

        function renderTelescopeSources() {
            const fragment = document.createDocumentFragment();
            BUILT_IN_TELESCOPES.forEach(function (configuration) {
                const item = document.createElement("li");
                item.appendChild(document.createTextNode(configurationLabel(configuration) + ": "));
                appendTelescopeSourceLinks(item, configuration);
                fragment.appendChild(item);
            });
            dom.telescopeSourceList.replaceChildren(fragment);
        }

        function renderCatalogueDisclosure() {
            dom.catalogueDisclosure.replaceChildren();
            const historyLink = document.createElement("a");
            historyLink.href = PULSAR_CATALOGUE.historyUrl;
            historyLink.target = "_blank";
            historyLink.rel = "noopener noreferrer";
            historyLink.textContent = PULSAR_CATALOGUE.source + " v" + PULSAR_CATALOGUE.version;

            const dapLink = document.createElement("a");
            dapLink.href = PULSAR_CATALOGUE.provenance.dapLandingUrl;
            dapLink.target = "_blank";
            dapLink.rel = "noopener noreferrer";
            dapLink.textContent = "CSIRO Data Access Portal v" + PULSAR_CATALOGUE.provenance.dapVersion;

            const licenseLink = document.createElement("a");
            licenseLink.href = PULSAR_CATALOGUE.provenance.licenseDeedUrl;
            licenseLink.target = "_blank";
            licenseLink.rel = "noopener noreferrer";
            licenseLink.textContent = PULSAR_CATALOGUE.provenance.licenseName;

            if (PULSAR_CATALOGUE.mode === "embedded-snapshot") {
                dom.catalogueDisclosure.append(
                    document.createTextNode("Search uses all "),
                    document.createTextNode(String(PULSAR_CATALOGUE.embeddedRecordCount)),
                    document.createTextNode(" records from "),
                    historyLink,
                    document.createTextNode(", released " + PULSAR_CATALOGUE.releasedOn + " and retrieved " + PULSAR_CATALOGUE.retrievedOn + ". No records were excluded. Database SHA-256: " + PULSAR_CATALOGUE.provenance.databaseSha256 + ". Source compact-file SHA-256: " + PULSAR_CATALOGUE.provenance.compactSnapshotSha256 + ". Embedded canonical-row SHA-256: " + PULSAR_CATALOGUE.provenance.embeddedCanonicalRowsSha256 + ". Extraction rule: " + PULSAR_CATALOGUE.extractionRule)
                );
            } else {
                dom.catalogueDisclosure.append(
                    historyLink,
                    document.createTextNode(" contains " + PULSAR_CATALOGUE.fullSnapshotRecordCount + " records. This deployment does not redistribute the transformed snapshot because the published ATNF/CSIRO terms do not clearly grant that permission. Manual pulsar entry is active as the plan-approved fallback.")
                );
            }

            dom.catalogueAcknowledgement.replaceChildren();
            const sourceLink = document.createElement("a");
            sourceLink.href = PULSAR_CATALOGUE.sourceUrl;
            sourceLink.target = "_blank";
            sourceLink.rel = "noopener noreferrer";
            sourceLink.textContent = PULSAR_CATALOGUE.source;
            dom.catalogueAcknowledgement.append(
                document.createTextNode("Data package: "),
                dapLink,
                document.createTextNode("; " + PULSAR_CATALOGUE.provenance.attribution + ". Licensed under the "),
                licenseLink,
                document.createTextNode(". Catalogue reference: "),
                sourceLink,
                document.createTextNode("; " + PULSAR_CATALOGUE.acknowledgement)
            );
            dom.catalogueLicense.textContent = PULSAR_CATALOGUE.licenseNotice;
        }

        function bindEvents() {
            dom.telescopeSelect.addEventListener("change", function () {
                const selectedId = dom.telescopeSelect.value;
                if (selectedId === "manual") {
                    beginDialogTransaction("telescope", dom.telescopeSelect);
                    applyTelescope("manual", { savePreference: false });
                    openValueDialog("telescope", "area", dom.telescopeSelect);
                    return;
                }
                applyTelescope(selectedId);
                state.committedTelescopeSelectValue = selectedId;
            });

            dom.resetTelescope.addEventListener("click", function () {
                if (state.selectedTelescope) {
                    applyTelescope(state.selectedTelescope.id, { savePreference: false });
                }
            });

            dom.openValuesTelescope.addEventListener("click", function () {
                openValueDialog("telescope", "area", dom.openValuesTelescope);
            });

            dom.openValuesPulsar.addEventListener("click", function () {
                openValueDialog("pulsar", "period", dom.openValuesPulsar);
            });

            dom.closeTelescopeDialog.addEventListener("click", function () {
                cancelDialog("telescope");
            });

            dom.cancelTelescopeValues.addEventListener("click", function () {
                cancelDialog("telescope");
            });

            dom.closePulsarDialog.addEventListener("click", function () {
                cancelDialog("pulsar");
            });

            dom.cancelPulsarValues.addEventListener("click", function () {
                cancelDialog("pulsar");
            });

            dom.applyTelescopeValues.addEventListener("click", applyTelescopeDialog);
            dom.applyPulsarValues.addEventListener("click", applyPulsarDialog);

            dom.telescopeDialog.addEventListener("cancel", function (event) {
                event.preventDefault();
                cancelDialog("telescope");
            });

            dom.pulsarDialog.addEventListener("cancel", function (event) {
                event.preventDefault();
                cancelDialog("pulsar");
            });

            dom.telescopeDialog.addEventListener("click", function (event) {
                if (event.target === dom.telescopeDialog) {
                    cancelDialog("telescope");
                }
            });

            dom.pulsarDialog.addEventListener("click", function (event) {
                if (event.target === dom.pulsarDialog) {
                    cancelDialog("pulsar");
                }
            });

            dom.saveCustomTelescope.addEventListener("click", function () {
                dom.customPanel.hidden = false;
                dom.customError.textContent = "";
                if (!dom.customName.value && state.selectedTelescope) {
                    dom.customName.value = state.selectedTelescope.telescopeName + " copy";
                }
                dom.customName.focus();
            });

            dom.cancelSaveCustom.addEventListener("click", function () {
                dom.customPanel.hidden = true;
                dom.customError.textContent = "";
                dom.saveCustomTelescope.focus();
            });

            dom.confirmSaveCustom.addEventListener("click", saveCustomTelescope);
            dom.deleteCustomTelescope.addEventListener("click", deleteSelectedCustomTelescope);

            dom.customName.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    saveCustomTelescope();
                }
            });

            dom.fields.time.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    dom.form.requestSubmit();
                }
            });

            dom.manualPulsar.addEventListener("click", function () {
                beginDialogTransaction("pulsar", dom.manualPulsar);
                clearPulsarSelection(true);
                openValueDialog("pulsar", "period", dom.manualPulsar);
            });

            dom.pulsarSearch.addEventListener("input", function () {
                if (state.selectedPulsar) {
                    const selectedDisplay = state.selectedPulsar.jName + (state.selectedPulsar.bName ? " / " + state.selectedPulsar.bName : "");
                    if (dom.pulsarSearch.value !== selectedDisplay) {
                        clearPulsarSelection(false);
                    }
                }

                const query = dom.pulsarSearch.value;
                if (normalisePulsarQuery(query).length < 2) {
                    closeSuggestions();
                    dom.pulsarSearchHelp.textContent = "Type 2+ characters.";
                    return;
                }
                renderSuggestions(searchPulsars(query, 8));
            });

            dom.pulsarSearch.addEventListener("keydown", function (event) {
                if (!state.suggestions.length) {
                    if (event.key === "Escape") {
                        closeSuggestions();
                    }
                    return;
                }

                if (event.key === "ArrowDown") {
                    event.preventDefault();
                    state.activeSuggestionIndex = (state.activeSuggestionIndex + 1) % state.suggestions.length;
                    renderSuggestionActiveState();
                } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    state.activeSuggestionIndex = state.activeSuggestionIndex <= 0
                        ? state.suggestions.length - 1
                        : state.activeSuggestionIndex - 1;
                    renderSuggestionActiveState();
                } else if (event.key === "Enter") {
                    event.preventDefault();
                    const selectedIndex = state.activeSuggestionIndex >= 0
                        ? state.activeSuggestionIndex
                        : 0;
                    selectPulsar(state.suggestions[selectedIndex].index);
                } else if (event.key === "Escape") {
                    event.preventDefault();
                    closeSuggestions();
                } else if (event.key === "Tab") {
                    closeSuggestions();
                }
            });

            dom.pulsarSuggestions.addEventListener("click", function (event) {
                const option = event.target.closest("[data-catalogue-index]");
                if (option) {
                    selectPulsar(Number(option.dataset.catalogueIndex));
                }
            });

            document.addEventListener("click", function (event) {
                if (!event.target.closest(".combobox-wrap")) {
                    closeSuggestions();
                }
            });

            dom.fluxMeasurement.addEventListener("change", function () {
                if (!state.selectedPulsar || dom.fluxMeasurement.value === "manual") {
                    if (state.pulsarBaseline) {
                        applyFluxMeasurement(null);
                    }
                    return;
                }
                const frequency = Number(dom.fluxMeasurement.value.replace("catalogue-", ""));
                const measurement = availableFluxMeasurements(state.selectedPulsar).find(function (item) {
                    return item.frequencyMHz === frequency;
                }) || null;
                applyFluxMeasurement(measurement);
            });

            Object.keys(dom.fields).forEach(function (uiKey) {
                const field = dom.fields[uiKey];
                const eventName = field.tagName === "SELECT" ? "change" : "input";
                field.addEventListener(eventName, function () {
                    invalidateResult();
                    clearFieldError(uiKey);
                    clearFormStatus();
                    if (
                        state.selectedPulsar &&
                        (uiKey === "flux" || uiKey === "fluxFrequency") &&
                        dom.fluxMeasurement.value !== "manual"
                    ) {
                        dom.fluxMeasurement.value = "manual";
                    }
                    if (PULSAR_UI_KEYS.indexOf(uiKey) !== -1) {
                        setFieldMissing(uiKey, field.value.trim() === "");
                    }
                    updateOverrideStates();
                });
            });

            dom.form.addEventListener("submit", handleCalculation);
        }

        loadStoredState();
        const preferredTelescope = findTelescope(state.preferences.selectedTelescopeId)
            ? state.preferences.selectedTelescopeId
            : "";
        renderTelescopeOptions(preferredTelescope);
        renderTelescopeSources();
        renderCatalogueDisclosure();
        bindEvents();

        if (preferredTelescope) {
            applyTelescope(preferredTelescope, { savePreference: false });
            state.committedTelescopeSelectValue = preferredTelescope;
        } else {
            applyTelescope("manual", { savePreference: false });
            state.committedTelescopeSelectValue = "";
            showNoTelescopeSelection();
        }
        clearPulsarSelection(true);
        clearResult();

        if (PULSAR_CATALOGUE.mode === "manual-fallback") {
            dom.pulsarSearch.disabled = true;
            dom.pulsarSearch.placeholder = "Catalogue lookup awaiting redistribution permission";
            dom.pulsarSearchHelp.textContent = "Manual pulsar entry is active. The complete ATNF snapshot was not embedded because redistribution permission is unclear.";
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialiseApp, { once: true });
    } else {
        initialiseApp();
    }
}());
