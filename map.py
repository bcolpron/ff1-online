import sys
import re

WALKABLE = 1
DENSE_FOREST = 2
SAILABLE = 4
CANOEABLE = 8
LANDABLE = 16
SPECIAL = 32
 
terrains = {
    # Land
    "15c6c6f54496f182cc0a93b26f36b265": 0,
    "0963c96a6c2b190312ff796d19e5b15d": 0,
    "eb2ab31b8d1e4b5781f58cc9e9323681": 0,
    "e89c0e30e814bd16426cde4b838e90f6": 0,
    "539f3d2cffd99ba8141c25e6d22536ba": 0,
    "29fa0d50751a0dab520e12f1318f188f": 0,
    "b9bcde877b5e8da7424f81aeab6c74d4": 0, # hole limits
    "bb9753e278780902ea2730cfecc38ca1": 0, # hole limits

    # Marsh
    "28c526350dab9a2e8f89b7eef417ce76": 0,
    "e4006cf9e967a74a45af03ac31389603": 0,
    "fc2a05631ddd1a3ca5c8a2da7feb162a": 0,
    "83e0b3711e8d7b9bb2867583839abb0f": 0,
    "f4e9e09079bd3bd8f3470af090aa72dc": 0,
    

    # Forest
    "69cd570ca9f906626eb2db840c65fb20": 0,
    "df84b93b9cd0b8ada225d943ef5b502d": 0,
    "1326c180bfd22c30a8dc2ed08a6a5e02": 0,
    "c5001a4a42e8621c7f02b0d5c4719c50": 0,
    "e962ce18c30f41a7233de9bc240acb5d": 0,
    "106ec9fdd07b1a2628c2bfe43867adc0": 0,
    "f8aa1dcf3805e271c8f2f55a713285d4": 0,
    "4688eea622928c3679cef40dd51b08d4": 0,
    "6696fa09e82781ba9e79ef44e8af7aba": 0,
    
    # Desert
    "4a38cbfeb2585c39326bf7f7df61d8b6": 0,
    "ec2e10283589510a2f90c8c25e407844": 0,
    "d39819e9dec07ca1fe30a0a7842d9a16": 0,
    "749fa898ee3c8a8d4da57cd52aa15cfc": 0,
    "783ef28241a6575258f6d8aaf1d6edff": 0,
    "6d42c0388cc7ca663fc55b0faae24f66": 0, # Tower
    
    # Special (gateway to other places)
    "7dfb50c06c75f6f29a908d58bdbb74bf": 0,
    "8e6ff0ee3d9d768870ddd41062087fce": 0,
    "f065c9b729dec547ab47cb11e0a8a7c3": 0,
    "e5a948070d79c09e35e2ec3fe73108ee": 0,
    "15aaad4991d57368eb2cb9ba92571d69": 0,
    "15c609e74f15a5a93f21340c8ab9e929": 0,
    "eeae27c18f68e1fff986d05991f2ad31": 0,
    "c438eb27bfdc887f8ff00fe269156654": 0,
    "d2a0a2c34f704d753f03fad95f7ae77a": 0,
    "eded16ac8d99461dcae22bcc578992c2": 0,
    "e93990ad96a713526dbd9043a4cab07f": 0,
    "ce1ddc571604b6c970b1396f55a93342": 0,
    "ec21b066766d75ea3d1af12d6306b81c": 0,
    "cc98ae52a46a5e02f274e611e43eeb25": 0,
    "64b3e9ad8e9386f3a413bebcf3703e7b": 0,
    "bdce7d489cc879d3e0eeca665da5f313": 0,
    "234f3af8188a8a76cada8ffc068a4747": 0,
    "439dcab633862ec700723a06b4351163": 0,
    "519f5cc200415a216b505965f860cdef": 0,
    "b80d063bb2fd355f60727f0941dc8012": 0,
    "7970e9644b463df257b662bf65f59030": 0,
    "8964d09764ac71f166d2984d63ba78b5": 0,
    "754367e1127fabf6f3abc46961e5958a": 0,
    
    # Sea
    "ae9dd9e35c77f85c612d4659aa87de5d": 1,
    "c22b615966c7be0ab54aceda802dc208": 1,
    "4d153e555e58fcb156c7fae758d8abdb": 1,
    "72957a017ca718ff592fd1272e14e949": 1,
    "f8f86c54a07447871af71c7dac7c3fbc": 1,
    "159974876e5c1010f63b649eed8e88c5": 0,
    "e85e36920eddd7e9488d78fa33eefbe2": 0,
    "ca9b0232b434c5a4eea437445155edb9": 0,
    "54ecbd473b0e6490b9d14b65faaee38d": 0,
    
    # Pier
    "31ca36b1bb5865bbfbf69648b92c3a79": 0,
    "8562ebdd9f7783be056f0095faaccbe3": 0,
    "a83fbd64e28f8227d81467b4016b444e": 0,
    "ad0010b73f2467f5553e54449f005a51": 0,
    "ce12beab018e19c87910d2561f003cc9": 0,
    
    # River
    "4227c9820f5b3b3c168f7069821af649": 1,
    "45554ce51a5736af8fd86581e3f58803": 0,
    "485277e4cb63354b56a7e685014be3ed": 0,
    "cb9052c48eafdd63fd538d32a8a04499": 0,
    "df997b78015f23035273d828be7e882c": 1,
    
    # Montains
    "006e2c9c3760509f3e13b680bca6c402": 2,
    "8f3f4595b07686f90b85750663479d75": 2,
    "69c434a8053cb516f99feaa4301393f8": 2,
    "328e7e9c1efd122ed461a461430b1ea1": 2,
    "354d92285813c045d39cb3360bd2dd4b": 2,
    "2226aaa86c48d328dadb2cd47e131f97": 2,
    "6661a2ef64a9ee5267c9988a358eadbb": 2,
    "7496e9f8e3453803bdb0df9e0540eb03": 2,
    "7875942feebabe5024167fd48a138b45": 2,
    
    # City
    "2942ebf5a094dabfde7e9fff6a03298c": 0,
    "1bbf53a5c3c7151086d90867673fd59e": 3,
    "03b0c26ea3be7cc6a0718bc0c4b745bb": 3,
    "3e44daa0606a9a2d84b9febadc52c37f": 3,
    "7dff2c33330408c0de27967322ece571": 3,
    "39de423b8529c2344d73a22593507152": 3,
    "162d5c2cf90c8e529726f0234451793f": 3,
    "785f80060220604b927f417bad8f38d4": 3,
    "9693b9bffe3e00b19c98a4e6384c84c2": 3,
    "71661df091f752c0d0674a0f32ae44cd": 3,
    "6537210bf1063cde8056d51457854e0d": 3,
    "95783470e86387153262d0240db44d97": 3,
    "57530550628699abb568cbca9ef74625": 3,
    "a218257ffc4e74f9519a3057e926e866": 3,
    "b3cdf02b04da7d8ee828c55a9755c220": 3,
    "cb8901089817fe3bb4ff6252d7e35f53": 3,
    "d12269289e373d26b79f7c96c9785ba4": 3,
    "dc655efcc346b29b5c446bfc093558f1": 0,
    "fd760f6b430533462e588e52f916bc62": 0,
    "e7556ca4167e3a95a410327af6461d5c": 3,
    "e76544f2ebd8687d68f581220be9efac": 3,
    "f4f7160fc6461bc81149431aee3b62b7": 3,
    "fd668e71459b7d84637d0eec66f695a1": 3,
    "fe8050b5fd8a9cf35ec5dfbf07fa52f2": 3,
    
    #Bridge
    "99999999999999999999999999999999": 0,
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
            
            

def genTilesJs():
    print ("var tiles= [")
    for i in range(256):
        sys.stdout.write('     [')
        for j in range(256):
            sys.stdout.write(str(tiles[i][j]) + ',')
        print ("],")
    print ("];")

if __name__ == "__main__":
    parseTilesFiles("tiles.txt")
    genTilesJs()