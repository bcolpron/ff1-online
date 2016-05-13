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
    "15c6c6f54496f182cc0a93b26f36b265": WALKABLE,
    "0963c96a6c2b190312ff796d19e5b15d": WALKABLE,
    "eb2ab31b8d1e4b5781f58cc9e9323681": WALKABLE,
    "e89c0e30e814bd16426cde4b838e90f6": WALKABLE,
    "539f3d2cffd99ba8141c25e6d22536ba": WALKABLE,
    "29fa0d50751a0dab520e12f1318f188f": WALKABLE,
    "b9bcde877b5e8da7424f81aeab6c74d4": WALKABLE, # hole limits
    "bb9753e278780902ea2730cfecc38ca1": WALKABLE, # hole limits

    # Marsh
    "28c526350dab9a2e8f89b7eef417ce76": WALKABLE,
    "e4006cf9e967a74a45af03ac31389603": WALKABLE,
    "fc2a05631ddd1a3ca5c8a2da7feb162a": WALKABLE,
    "83e0b3711e8d7b9bb2867583839abb0f": WALKABLE,
    "f4e9e09079bd3bd8f3470af090aa72dc": WALKABLE,
    

    # Forest
    "69cd570ca9f906626eb2db840c65fb20": WALKABLE | DENSE_FOREST,
    "df84b93b9cd0b8ada225d943ef5b502d": WALKABLE,
    "1326c180bfd22c30a8dc2ed08a6a5e02": WALKABLE,
    "c5001a4a42e8621c7f02b0d5c4719c50": WALKABLE,
    "e962ce18c30f41a7233de9bc240acb5d": WALKABLE | DENSE_FOREST,
    "106ec9fdd07b1a2628c2bfe43867adc0": WALKABLE,
    "f8aa1dcf3805e271c8f2f55a713285d4": WALKABLE,
    "4688eea622928c3679cef40dd51b08d4": WALKABLE,
    "6696fa09e82781ba9e79ef44e8af7aba": WALKABLE,
    
    # Desert
    "4a38cbfeb2585c39326bf7f7df61d8b6": WALKABLE,
    "ec2e10283589510a2f90c8c25e407844": WALKABLE,
    "d39819e9dec07ca1fe30a0a7842d9a16": WALKABLE,
    "749fa898ee3c8a8d4da57cd52aa15cfc": WALKABLE,
    "783ef28241a6575258f6d8aaf1d6edff": WALKABLE,
    "6d42c0388cc7ca663fc55b0faae24f66": WALKABLE, # Tower
    
    # Special (gateway to other places)
    "7dfb50c06c75f6f29a908d58bdbb74bf": WALKABLE,
    "8e6ff0ee3d9d768870ddd41062087fce": WALKABLE,
    "f065c9b729dec547ab47cb11e0a8a7c3": WALKABLE,
    "e5a948070d79c09e35e2ec3fe73108ee": WALKABLE,
    "15aaad4991d57368eb2cb9ba92571d69": WALKABLE,
    "15c609e74f15a5a93f21340c8ab9e929": WALKABLE,
    "eeae27c18f68e1fff986d05991f2ad31": WALKABLE,
    "c438eb27bfdc887f8ff00fe269156654": WALKABLE,
    "d2a0a2c34f704d753f03fad95f7ae77a": WALKABLE,
    "eded16ac8d99461dcae22bcc578992c2": WALKABLE,
    "e93990ad96a713526dbd9043a4cab07f": WALKABLE,
    "ce1ddc571604b6c970b1396f55a93342": WALKABLE,
    "ec21b066766d75ea3d1af12d6306b81c": WALKABLE,
    "cc98ae52a46a5e02f274e611e43eeb25": WALKABLE,
    "64b3e9ad8e9386f3a413bebcf3703e7b": WALKABLE,
    "bdce7d489cc879d3e0eeca665da5f313": WALKABLE,
    "234f3af8188a8a76cada8ffc068a4747": WALKABLE,
    "439dcab633862ec700723a06b4351163": WALKABLE,
    "519f5cc200415a216b505965f860cdef": WALKABLE,
    "b80d063bb2fd355f60727f0941dc8012": WALKABLE,
    "7970e9644b463df257b662bf65f59030": WALKABLE,
    "8964d09764ac71f166d2984d63ba78b5": WALKABLE,
    "754367e1127fabf6f3abc46961e5958a": WALKABLE,
    
    # Sea
    "ae9dd9e35c77f85c612d4659aa87de5d": SAILABLE,
    "c22b615966c7be0ab54aceda802dc208": SAILABLE,
    "4d153e555e58fcb156c7fae758d8abdb": SAILABLE,
    "72957a017ca718ff592fd1272e14e949": SAILABLE,
    "f8f86c54a07447871af71c7dac7c3fbc": SAILABLE,
    "159974876e5c1010f63b649eed8e88c5": WALKABLE,
    "e85e36920eddd7e9488d78fa33eefbe2": WALKABLE,
    "ca9b0232b434c5a4eea437445155edb9": WALKABLE,
    "54ecbd473b0e6490b9d14b65faaee38d": WALKABLE,
    
    # Pier
    "31ca36b1bb5865bbfbf69648b92c3a79": WALKABLE,
    "8562ebdd9f7783be056f0095faaccbe3": WALKABLE,
    "a83fbd64e28f8227d81467b4016b444e": WALKABLE,
    "ad0010b73f2467f5553e54449f005a51": WALKABLE,
    "ce12beab018e19c87910d2561f003cc9": WALKABLE,
    
    # River
    "4227c9820f5b3b3c168f7069821af649": CANOEABLE,
    "45554ce51a5736af8fd86581e3f58803": CANOEABLE,
    "485277e4cb63354b56a7e685014be3ed": CANOEABLE,
    "cb9052c48eafdd63fd538d32a8a04499": CANOEABLE,
    "df997b78015f23035273d828be7e882c": CANOEABLE,
    
    # Montains
    "006e2c9c3760509f3e13b680bca6c402": 0,
    "8f3f4595b07686f90b85750663479d75": 0,
    "69c434a8053cb516f99feaa4301393f8": 0,
    "328e7e9c1efd122ed461a461430b1ea1": 0,
    "354d92285813c045d39cb3360bd2dd4b": 0,
    "2226aaa86c48d328dadb2cd47e131f97": 0,
    "6661a2ef64a9ee5267c9988a358eadbb": 0,
    "7496e9f8e3453803bdb0df9e0540eb03": 0,
    "7875942feebabe5024167fd48a138b45": 0,
    
    # City
    "2942ebf5a094dabfde7e9fff6a03298c": WALKABLE,
    "1bbf53a5c3c7151086d90867673fd59e": 0,
    "03b0c26ea3be7cc6a0718bc0c4b745bb": 0,
    "3e44daa0606a9a2d84b9febadc52c37f": 0,
    "7dff2c33330408c0de27967322ece571": 0,
    "39de423b8529c2344d73a22593507152": 0,
    "162d5c2cf90c8e529726f0234451793f": 0,
    "785f80060220604b927f417bad8f38d4": 0,
    "9693b9bffe3e00b19c98a4e6384c84c2": 0,
    "71661df091f752c0d0674a0f32ae44cd": 0,
    "6537210bf1063cde8056d51457854e0d": 0,
    "95783470e86387153262d0240db44d97": 0,
    "57530550628699abb568cbca9ef74625": 0,
    "a218257ffc4e74f9519a3057e926e866": 0,
    "b3cdf02b04da7d8ee828c55a9755c220": 0,
    "cb8901089817fe3bb4ff6252d7e35f53": 0,
    "d12269289e373d26b79f7c96c9785ba4": 0,
    "dc655efcc346b29b5c446bfc093558f1": WALKABLE,
    "fd760f6b430533462e588e52f916bc62": WALKABLE,
    "e7556ca4167e3a95a410327af6461d5c": 0,
    "e76544f2ebd8687d68f581220be9efac": 0,
    "f4f7160fc6461bc81149431aee3b62b7": 0,
    "fd668e71459b7d84637d0eec66f695a1": 0,
    "fe8050b5fd8a9cf35ec5dfbf07fa52f2": 0,
    
    #Bridge
    "99999999999999999999999999999999": WALKABLE,
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