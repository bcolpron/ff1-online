#!/usr/bin/python

import sys
import re

WALKABLE = 1
DENSE_FOREST = 2
SAILABLE = 4
CANOEABLE = 8
LANDABLE = 16
SPECIAL = 32
DOCKABLE = 64
 
terrains = {
    # Land
    "013173e1e6df7a07df878c987e8238ba": WALKABLE,
    "d49ee92e82fa3144d245e2bee2b9c062": WALKABLE,
    "69a4570417b3e14ac18f660182ef3dcd": WALKABLE,
    "45cf79cd8f24596df5af6085be203459": WALKABLE,
    "a3d7033c25dc4d56acb1971b440e624f": WALKABLE,
    "5ba73644917dc909cf8c51b46d977c37": WALKABLE,
    "eb0ba8342997c2c65c2c80491b39ce72": WALKABLE, # hole limits
    "ab19c4568df8ad10e5e78a2ca5362ffb": WALKABLE, # hole limits

    # Marsh
    "11434a5596834c3d705dc47c3799940b": WALKABLE,
    "c2cf98a8e8e4b3a5fa9907201816d375": WALKABLE,
    "67c7c24551cf9ca7e85c0b746d9d24b3": WALKABLE,
    "f5519b6dbf3606dc57ccb46f33b1944c": WALKABLE,
    "2cf6c96a3a4222f4529c393ad8b10408": WALKABLE,

    # Forest
    "a843d5176ab5329a1cad40b899986e33": WALKABLE,
    "7648ee760377718f42dff7974b243d6d": WALKABLE,
    "4f719c3b90d4c5493e3552d78532f912": WALKABLE,
    "3d1438a0405aad89b3f4aade1e65138a": WALKABLE,
    "468d58cbe89908e092f973e5c9aa5fa1": WALKABLE,
    "185a50c7e0fe6bdfa5fa379a3e510b14": WALKABLE | DENSE_FOREST,
    "bbf889ae5a00dc370922a4a8472c8dd6": WALKABLE,
    "a66ce7d1b8cd04fffacfc0b128c2d1d6": WALKABLE,
    "474575bd9c476135bffed0f57edc6156": WALKABLE,
    "347d8fa18b8222178ccd2c24fdc63e91": WALKABLE,
    "6611e086766125be3420ea688454292e": WALKABLE,
    "a540c6945bf99af29c02bfe8fe817211": WALKABLE | DENSE_FOREST,
    "526167753b1cfe24d25c9910568afb56": WALKABLE,

    # Desert
    "06eda6b892ea71ae32e7f867e9d9cece": WALKABLE,
    "cb7a881f8624262a3586bf5af8e0a512": WALKABLE,
    "d6309a7d869ffd4b8a8a1cc623a6f733": WALKABLE,
    "6e27d131b4320282a33416385541fef5": WALKABLE,
    "b96129b33b06d0da7df81ec763cb91ca": WALKABLE,
    "80e1ba64e19ee4eb907267386a183e84": WALKABLE,
    "fd027f50525e3b74b8f5540a4bb8c1d0": WALKABLE,
    "4691d79203a377026ee86777b0ea1c87": WALKABLE,
    "0b1f8fcaab6f2a02d6ff4d738aa62c56": WALKABLE,
    "2836f1c8fbb84ee9e2f2f97a00e8d1f5": WALKABLE, # Tower
    "471c513db319a90e39d3bbe881e62c9c": WALKABLE,
    "06bccdc78fd015d8cd40c9671de29f10": WALKABLE,
    "26936662cfd1dcc9da7ae6234abfbff1": WALKABLE,

    # Special (gateway to other places)
    "a144589bc976a153bc5f3afa4203f47c": WALKABLE,
    "1de9462366386f9cc5c2d5087c5a2292": WALKABLE,
    "401bbaf5433177d551e983d39a610d5d": WALKABLE,
    "bff98d6bde38e7815605436bacdc498c": WALKABLE,
    "3adcff7b9b2cca7109f1b7181cc756b9": WALKABLE,
    "9ae9c7e90be3d70fe891635104942f2f": WALKABLE,
    "8a00d47a5ff1dcd8f46d4efe14284485": WALKABLE,
    "b3b5165e9e6d288ce08aff24db484cff": WALKABLE,
    "8abe07833a2b920abb4d83fcf26ee825": WALKABLE | SAILABLE,  # canal
    "126b953c4f0d1d9bcad35e2df69ca046": WALKABLE,
    "07a849d69f30d58527755b7993751fc5": WALKABLE,
    "cab421992f1b9d92c64cc585f9a2e58f": WALKABLE,
    "c80197701ca64bc7cf6e3bf7ffcc2375": WALKABLE,
    "8c421c6c74043db842256a7ee4f7df93": WALKABLE,
    "107b44520c043c6b98fb8b18a157f0b0": WALKABLE,
    "c8aee879f306b26fc8293910454d579d": WALKABLE,
    "cf9deebc14242dced39fd88501de8a96": WALKABLE,
    "a50ad011b3a5aaf6a062eb66af781d2a": WALKABLE,
    "76796c0234784be25b4c4b6e438780e7": WALKABLE,
    "2f085c126654513908bb4a2c01d7326a": WALKABLE,
    "bb443473a9d3de6d8890a3798919015f": WALKABLE,
    "7217697f0e0fa84de838fd64adf309d4": WALKABLE,
    "42031d994e50a4fd76d1262c55ba4b96": WALKABLE,
    "27ad42b38b1cbcafa0139b29792adb58": WALKABLE,
    "96008fa9c9fbd5139920fe84f6d29622": WALKABLE | SAILABLE, #bridge
    "32e4d5f02d4fe47d4367b8df1eb2e6ae": WALKABLE,

    # Sea
    "614882315e12742f039d0a9915321c70": WALKABLE,
    "06b3706a0cb749fd9fd2c69d76d7986c": SAILABLE,
    "5ea3e41b2d64c45b0b3c722b802c0fd9": WALKABLE,
    "41cc4944d3a47c0de6f5d725cc1b8a43": WALKABLE,
    "413f53cd69700a201d88f51cead96180": SAILABLE,
    "3270e7dfcd36cb3d0141ced1ef22fda1": SAILABLE,
    "a0f2e8d2b983991c7afb35cef03d8f45": SAILABLE,
    "6325cc466e766f7938d25d1f6b80ac5f": WALKABLE,
    "39f08081e75fff47eab1b4d113d2ca2c": SAILABLE,

    # Pier
    "22044d79cc1bdd7a95a6000748b33644": WALKABLE | DOCKABLE,
    "82656ff5292286ac0c0b64a4509d2392": WALKABLE | DOCKABLE,
    "bf3cc20b0cfa04e1417872aec14c07b9": WALKABLE | DOCKABLE,
    "5dc139eb5559ae989de271986308a1ae": WALKABLE | DOCKABLE,
    "cbd254c4a598b298e7346c6beb6560ba": WALKABLE | DOCKABLE,

    # River
    "709308dfcb131a206951a6170ccf4d0c": CANOEABLE,
    "46a8fbb6827a6a68552bf31d5fff76a0": CANOEABLE,
    "4be7cbd38a5c0268fb7a36504a520cb9": CANOEABLE,
    "89435bfc4de0a0ffda83ae6c08614360": CANOEABLE,
    "c0a5c0c2ac41daefcfde5205c60bb525": CANOEABLE,

    # Montains
    "004117dd6c205d8acacfe3ecffc61cdc": 0,
    "c766d917a7cc56f75637470e54203721": 0,
    "161aad062c0b14ee2bf7c9f545caf1b0": 0,
    "3b21ac742d0ea99002428bb3ec2a0246": 0,
    "8421de0c5073d0779639855e63c46ad6": 0,
    "ff2f6c0e058a4dce38c06df94e39ef43": 0,
    "824670f87a1270fdc2927eee7e189438": 0,
    "18db23f5af1e84ea39c7ea2f17824e33": 0,
    "88bce43cd6e8ceaeffca48fb9f474e41": 0,
    "3ef1257ed22c5813a3ee1b99383439ad": 0,
    "ed0c364d338db5f578ee696523044d0e": 0,
    "a43195a4a1ac7c7caf39b6086c604390": 0,
    "0035251095af27df284fe2031ee45f41": 0,
    
    # Buildings and walls
    "e2177180befd6e6cae275cf0155117a7": 0,
    "0e39a95909ebeb650fc1f431a03772f4": 0,
    "54706dea371549dea10ac399b481d9ec": 0,
    "efaaf4f5fb9c96aabf044de54706bb98": WALKABLE,
    "e493f19c77d2291524db492dfbac7034": 0,
    "c8604305f0d4bd336b15981a281e705b": 0,
    "f1c977edd9295ffba5e635bb9c26b5b0": 0,
    "de17f72b1b6739e1cd1dd5288284e2db": 0,
    "984a12548b68cdbbab67710d21a9cbc2": 0,
    "7abb507404a71852746787b1a1606b4e": 0,
    "e9a1a1f244b94ce9f4b56d363493e5a0": WALKABLE,
    "0e77b081af5b2032eaee9d4a34ee6bb3": 0,
    "16454d790c29bb5d600f70e2033f720e": 0,
    "3c5185e0e08578ab0b9bf6d48fc22827": 0,
    "87e73d74f88082dd9f7fa0744520aa5c": WALKABLE,
    "c7fff493d273e8dbaa33aaafdae5e39c": 0,
    "4a08eff2c4956212070a31cf66ec995e": 0,
    "f2b2c77d68e03d731214bcd1286587e5": 0,
    "1e52eea58ebce4a67fefe519dca9469f": 0,
    "48be1811d2d15dd3d938de955b767eb3": 0,
    "54cb732bf54c9471137b6c5b9b057019": 0,
    "9ae8894dc2ea6c6e1f6d1a633595ad24": 0,
    "88ccec61979535899b214a4ce49af298": 0,
    "c3813000ddbe5d17c0eccadb9732219f": 0,
    
    # Cities
    "094fb9962356e624fe6dffdd7b7e49a5": WALKABLE,
    "1782878b13f2c685acd6ed500e755921": 0,
    "185de20e7837f2d3c1a4e22d1145911a": 0,
    "1fa81067abb1eb65d542cf0ccdf4863e": 0,
    "2becf825628896edc1012ecba51eb88e": 0,
    "336f6dd8c38e74f7e65b7bfb3103931a": 0,
    "3c7383b16aff73128b4b59d1e030fd0f": 0,
    "4700be03be5af3347ba7b3d3dea89126": 0,
    "4ae182619762f8256e4df0ce5017c046": 0,
    "4bd975ac90ab657bf951bdde86fc5a75": 0,
    "566a2795b25c388fd59889cd91ac2f84": WALKABLE,
    "59d629cae3c2c3e33111459eb7cfdc77": 0,
    "5e35f38b1bb23a3a8091f2766d511ed4": 0,
    "5e851be478878c2edfabcebc0f486b94": 0,
    "5f297b5cc1cbcd5d52f3b8e2059fe697": 0,
    "6dddf91eb4579fbb6f7aa47b2fa7d625": 0,
    "76faa50583f007a66226130000aa4661": 0,
    "7a843d76a3580e5fe4d94449fdbaa7b5": WALKABLE,
    "9490c3305138581f1f947bb8023d3430": 0,
    "999f1890b5bc52f30fbd96c3495e62d9": 0,
    "9c77735a0e73500edf8591ef5fb42234": WALKABLE,
    "ae53f81d03e314134f054a4caa35fbfc": 0,
    "b45bdeac8aa53978947aa9ec74958ffd": WALKABLE,
    "b4a66e0a2baf515f5c9487e097a3ac01": 0,
    "b6b00d2ee16ecb58d650b96803f54728": WALKABLE,
    "b8a5ad1e0d6065584b1b5922af0fa50c": 0,
    "c7065d1ff46bb5925193b1db5c69f005": 0,
    "cdc0383e683e3b1b25ec60cc6d9d8eda": 0,
    "d7390ee58e5765422f9af72b6ef32aff": 0,
    "dd6d6fdd61a5903fb3e487fdf9b8453a": WALKABLE,
    "e5d221b38477bbec76ba1ee0fdd14632": 0,
    "e6b851c5c7a8cc48becb70744d785ad6": 0,
    "e71458a7d6abd8c91600f47301854cb3": 0,
    "eb266a0c789ed729ef664f133308eb84": 0,
    "ee882a3db4ef62978086bc8c496d0ec7": WALKABLE,
    "f09156dba089dedb4e9a73c7fa9ce21d": 0,
    
    # Temple of fiends
    "5e9fd02a05706bbd1656021825dee091": WALKABLE, # Floor
    "2c7c5bdb671bbec0e37fcef4ad2b2b57": WALKABLE, # Door
    "7900692e89d32cef1992bdf34069729c": WALKABLE, # Stair
    "fe4c40208b1196a7a4dfb7c54acd1583": WALKABLE, # Black
    "9e03e3017167b43b0df163c09e05ac19": WALKABLE, # Black with bottom shadow
    "0518314298a079e4bc75e6f3bcac9a49": 0,  # room inner wall
    "15fabd41c179cf3aa9ac3ecf25223359": 0,  # chest
    "226034a0f5698fab4afd1d7a96c5891f": 0,  # wall corner
    "2835d74f9021cb8458bad2db64fa49b3": 0,  # orb
    "314064a0530fc6b18c86d30ca1aa931b": 0,  # room inner left wall
    "43912550e079919efa7315c220c04494": 0,  # deco
    "4d8bc238ac283d390133fc2fb2bc9021": 0,  # orb (main)
    "53e5c54dc76968e3fa749ee50e0e0bca": 0,  # room inner left-botton wall
    "5ba98931ca4d38a01484291566558a7d": 0,  # deco
    "68036ef3bc5e9049a2724d0487cb7223": 0,  # wall
    "68ad7d0c447cdda77b3602dc90ef797f": 0,  # wall
    "701049054a92b6369450c3416b79a8cb": 0,  # wall
    "a7f29a2db73861dfbabcbd249507b852": 0,  # wall corner
    "bc68b07877fca2db121b5a2cb8a11f09": 0,  # statue
    "c04ebe550ee8c80c8651f671fab11aa7": 0,  # pillar
    "c71ea7f0742daec3694d6f9a4f7b3946": 0,  # room inner right wall
    "dd4e6bc07262b34b803970ee7b3ded1f": 0,  # room inner wall
    "dec3c393d694f5678b5c1ecfa9fb4d63": 0,  # room inner wall
    "eccc0bb68214a51bc137482585206546": 0,  # statue
    "fcadda9d8e69a0a6c836332663b77d1a": 0,  # room inner right-botton wall
    }

tiles = {}

def parseTilesFiles(path):
    parser = re.compile('(\w+)\s+(\d+)/(\d+).png\n')
    with open(path) as f:
        for line in f:
            m = re.match(parser, line)
            code = terrains.get(m.group(1))
            if code == None:
                raise ValueError("terrain " + m.group(1) + " unknown")
            tiles.setdefault(int(m.group(2)), {}).update({int(m.group(3)): code})
            
def genTilesJs(maxX, maxY):
    print ("[")
    firstRow = True
    for i in range(maxX):
        if firstRow:
            firstRow = False
        else:
            sys.stdout.write(',')
        print ''
        sys.stdout.write('     [')
        firstCol = True;
        for j in range(maxY):
            if firstCol:
                firstCol = False
            else:
                sys.stdout.write(',')
            sys.stdout.write(str(tiles[i][j]))
        sys.stdout.write("]")
    print ''
    print ("]")

if __name__ == "__main__":

    tilesFile = sys.argv[1]
    maxX = int(sys.argv[2])
    maxY = int(sys.argv[3])
    
    parseTilesFiles(tilesFile)
    genTilesJs(maxX, maxY)