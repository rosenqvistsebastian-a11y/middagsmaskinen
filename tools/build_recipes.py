"""Genererar recipes.json. Kör: python3 tools/build_recipes.py"""
import json, pathlib

AVD = ["Frukt & grönt", "Bröd", "Mejeri & ägg", "Kött & fisk", "Vegetariskt kylt",
       "Fryst", "Skafferi", "Kryddor & såser"]
F, B, M, K, V, FR, S, KR = AVD

ING = {
 # frukt & grönt
 "gul lök": F, "rödlök": F, "vitlök": F, "tomat": F, "körsbärstomater": F, "gurka": F,
 "paprika": F, "morot": F, "potatis": F, "sötpotatis": F, "broccoli": F, "blomkål": F,
 "spenat": F, "sallad": F, "avokado": F, "citron": F, "lime": F, "champinjoner": F,
 "purjolök": F, "zucchini": F, "färsk ingefära": F, "färsk koriander": F, "färsk basilika": F,
 "dill": F, "salladslök": F, "äpple": F, "sockerärtor": F, "vitkål": F, "chili": F,
 "rucola": F,
 # bröd
 "tortillabröd": B, "pitabröd": B, "hamburgerbröd": B, "rostbröd": B, "tacoskal": B,
 # mejeri
 "ägg": M, "mjölk": M, "smör": M, "grädde": M, "matlagningsgrädde": M, "crème fraiche": M,
 "riven ost": M, "parmesan": M, "fetaost": M, "halloumi": M, "mozzarella": M,
 "turkisk yoghurt": M, "kesella": M, "cheddar": M,
 # kött & fisk
 "bacon": K, "falukorv": K, "kycklingfilé": K, "kycklinglårfilé": K, "nötfärs": K,
 "laxfilé": K, "torskfilé": K, "räkor": K, "rimmat sidfläsk": K, "köttbullar": K,
 "skinka": K, "hamburgare": K,
 # vegetariskt kylt
 "tofu": V, "färsk tortellini": V, "gnocchi": V,
 # fryst
 "falafel": FR, "fiskpinnar": FR, "pyttipanna": FR, "frysta ärtor": FR,
 "ugnspommes": FR, "frysta wokgrönsaker": FR, "fryst spenat": FR,
 # skafferi
 "pasta": S, "makaroner": S, "ris": S, "jasminris": S, "äggnudlar": S, "risnudlar": S,
 "couscous": S, "krossade tomater": S, "passerade tomater": S, "tomatpuré": S,
 "kokosmjölk": S, "kikärtor": S, "röda linser": S, "kidneybönor": S, "svarta bönor": S,
 "majs": S, "vetemjöl": S, "buljongtärning": S, "grön pesto": S, "soltorkade tomater": S,
 "jordnötssmör": S, "salsa": S, "arborioris": S, "vitt vin": S, "oliver": S, "lingonsylt": S,
 "potatismospulver": S, "tacokrydda": S, "honung": S,
 # kryddor & såser
 "soja": KR, "currypulver": KR, "röd currypasta": KR, "paprikapulver": KR, "spiskummin": KR,
 "chiliflakes": KR, "oregano": KR, "senap": KR, "ketchup": KR, "sweet chili": KR,
 "timjan": KR, "ostronsås": KR, "sambal oelek": KR, "majonnäs": KR, "garam masala": KR,
}
BAS = ["salt", "peppar", "olja", "vatten", "socker"]
for b in BAS: ING[b] = S

def i(namn, mangd=None, enhet=""):
    assert namn in ING, namn
    return {"namn": namn, "mangd": mangd, "enhet": enhet}

R = []
def r(namn, emoji, tid, taggar, ingr, steg):
    R.append({"id": len(R) + 1, "namn": namn, "emoji": emoji, "tid": tid, "portioner": 4,
              "taggar": taggar, "ingredienser": ingr, "steg": steg})

r("Pasta carbonara", "🍝", 20, ["snabb"],
  [i("pasta", 400, "g"), i("bacon", 140, "g"), i("ägg", 4, "st"), i("parmesan", 80, "g"), i("peppar"), i("salt")],
  ["Koka pastan i saltat vatten.", "Stek baconet krispigt.", "Vispa ägg och riven parmesan.",
   "Blanda varm pasta med bacon, rör ner äggblandningen snabbt utanför plattan. Mycket peppar!"])
r("Korv stroganoff", "🌭", 25, ["snabb", "billig"],
  [i("falukorv", 400, "g"), i("gul lök", 1, "st"), i("krossade tomater", 400, "g"), i("matlagningsgrädde", 2.5, "dl"),
   i("tomatpuré", 2, "msk"), i("senap", 1, "msk"), i("ris", 4, "dl"), i("smör")],
  ["Koka riset.", "Strimla korv och lök, fräs i smör.", "Rör ner tomatpuré, krossade tomater, grädde och senap.",
   "Låt puttra 5 min. Servera med ris."])
r("Pannkakor med sylt", "🥞", 30, ["billig", "veg"],
  [i("vetemjöl", 2.5, "dl"), i("mjölk", 6, "dl"), i("ägg", 3, "st"), i("smör", 3, "msk"), i("salt"), i("lingonsylt")],
  ["Vispa mjöl och hälften av mjölken slät.", "Vispa i resten av mjölken, ägg, salt och smält smör.",
   "Stek tunna pannkakor i smör.", "Servera med sylt (och kanske grädde)."])
r("Fiskpinnar med potatismos", "🐟", 20, ["snabb", "billig"],
  [i("fiskpinnar", 1, "paket"), i("potatismospulver", 1, "paket"), i("mjölk", 4, "dl"), i("smör", 2, "msk"),
   i("frysta ärtor", 300, "g"), i("citron", 1, "st")],
  ["Ugnsbaka fiskpinnarna enligt paketet.", "Rör ihop moset med mjölk, vatten och smör.",
   "Koka ärtorna 2 min.", "Servera med citronklyftor."])
r("Fredagstacos", "🌮", 25, ["snabb"],
  [i("nötfärs", 500, "g"), i("tacokrydda", 1, "påse"), i("tortillabröd", 8, "st"), i("tomat", 2, "st"), i("gurka", 1, "st"),
   i("sallad", 1, "st"), i("riven ost", 150, "g"), i("crème fraiche", 2, "dl"), i("salsa", 1, "burk"), i("majs", 1, "burk")],
  ["Bryn färsen och rör ner kryddan + lite vatten.", "Hacka grönsakerna.", "Värm bröden.", "Bygg själv vid bordet!"])
r("Kycklingcurry med ris", "🍛", 30, ["matlåda"],
  [i("kycklingfilé", 600, "g"), i("gul lök", 1, "st"), i("currypulver", 2, "msk"), i("kokosmjölk", 400, "ml"),
   i("paprika", 1, "st"), i("ris", 4, "dl"), i("olja"), i("salt")],
  ["Koka riset.", "Bryn kyckling i bitar med lök och curry.", "Häll i kokosmjölk och strimlad paprika.",
   "Puttra 10 min. Smaka av med salt."])
r("Pasta med linsbolognese", "🍅", 25, ["veg", "billig", "matlåda"],
  [i("pasta", 400, "g"), i("röda linser", 2, "dl"), i("gul lök", 1, "st"), i("vitlök", 2, "klyftor"), i("morot", 2, "st"),
   i("krossade tomater", 800, "g"), i("buljongtärning", 1, "st"), i("oregano"), i("olja")],
  ["Fräs hackad lök, vitlök och riven morot.", "Tillsätt linser, tomater, buljong och 2 dl vatten.",
   "Koka 15 min tills linserna är mjuka.", "Servera med pasta."])
r("Citronlax med pressad potatis", "🍋", 30, [],
  [i("laxfilé", 500, "g"), i("potatis", 800, "g"), i("citron", 1, "st"), i("smör", 3, "msk"), i("dill", 1, "kruka"),
   i("crème fraiche", 2, "dl"), i("salt"), i("peppar")],
  ["Koka potatisen.", "Lägg laxen i form, salta, citron på. Ugn 200° i 15 min.",
   "Rör crème fraiche med dill och citronskal.", "Pressa potatisen grovt med smör. Servera."])
r("Falafel i pitabröd", "🧆", 15, ["veg", "snabb"],
  [i("falafel", 1, "paket"), i("pitabröd", 4, "st"), i("turkisk yoghurt", 2, "dl"), i("vitlök", 1, "klyfta"),
   i("gurka", 1, "st"), i("tomat", 2, "st"), i("rödlök", 1, "st"), i("sallad", 1, "st")],
  ["Värm falafel och bröd i ugnen.", "Rör yoghurt med pressad vitlök och salt.",
   "Skiva grönsakerna.", "Fyll bröden – klart!"])
r("Kikärtscurry", "🥥", 25, ["veg", "billig", "matlåda"],
  [i("kikärtor", 2, "burkar"), i("gul lök", 1, "st"), i("vitlök", 2, "klyftor"), i("färsk ingefära", 1, "bit"),
   i("garam masala", 1, "msk"), i("krossade tomater", 400, "g"), i("kokosmjölk", 400, "ml"), i("spenat", 65, "g"),
   i("ris", 4, "dl")],
  ["Koka riset.", "Fräs lök, vitlök, ingefära och garam masala.", "Tillsätt tomat, kokosmjölk och kikärtor. Puttra 10 min.",
   "Vänd ner spenaten precis innan servering."])
r("Pyttipanna med stekt ägg", "🍳", 15, ["snabb", "billig"],
  [i("pyttipanna", 1, "påse"), i("ägg", 4, "st"), i("smör"), i("lingonsylt"), i("senap")],
  ["Stek pyttin i smör tills den får färg.", "Stek äggen.", "Servera med sylt eller senap. Ingen skam!"])
r("Köttbullar och makaroner", "🧆", 15, ["snabb", "billig"],
  [i("köttbullar", 500, "g"), i("makaroner", 4, "dl"), i("smör"), i("ketchup"), i("lingonsylt")],
  ["Koka makaronerna.", "Stek köttbullarna i smör.", "Servera med ketchup eller lingon – välj sida!"])
r("Halloumiburgare", "🍔", 20, ["veg", "snabb"],
  [i("halloumi", 400, "g"), i("hamburgerbröd", 4, "st"), i("sallad", 1, "st"), i("tomat", 2, "st"), i("rödlök", 1, "st"),
   i("majonnäs"), i("sweet chili"), i("avokado", 1, "st")],
  ["Skiva halloumin och stek gyllene.", "Rosta bröden.", "Rör majonnäs med sweet chili.", "Bygg burgare med alla godsaker."])
r("Svampomelett med ost", "🍄", 15, ["veg", "snabb", "billig"],
  [i("ägg", 8, "st"), i("mjölk", 1, "dl"), i("champinjoner", 250, "g"), i("riven ost", 100, "g"), i("smör"),
   i("salladslök", 2, "st"), i("salt"), i("peppar")],
  ["Stek skivad svamp i smör.", "Vispa ägg, mjölk, salt och peppar.", "Häll över svampen, låt stelna på medelvärme.",
   "Strö över ost och salladslök, vik ihop."])
r("Kycklingwok med nudlar", "🥢", 20, ["snabb"],
  [i("kycklingfilé", 500, "g"), i("äggnudlar", 250, "g"), i("frysta wokgrönsaker", 500, "g"), i("soja", 3, "msk"),
   i("ostronsås", 2, "msk"), i("vitlök", 2, "klyftor"), i("färsk ingefära", 1, "bit"), i("olja")],
  ["Koka nudlarna.", "Woka kycklingstrimlor heta i olja.", "Tillsätt grönsaker, vitlök och ingefära.",
   "Vänd ner nudlar, soja och ostronsås."])
r("Tortellini med spenat & grädde", "🥟", 15, ["veg", "snabb"],
  [i("färsk tortellini", 500, "g"), i("fryst spenat", 250, "g"), i("matlagningsgrädde", 2.5, "dl"), i("vitlök", 1, "klyfta"),
   i("parmesan", 50, "g"), i("peppar")],
  ["Koka tortellinin.", "Värm grädde, spenat och vitlök i en panna.", "Rör ner parmesan och tortellini.", "Peppra rejält."])
r("Pestopasta med kyckling", "🌿", 20, ["snabb", "matlåda"],
  [i("pasta", 400, "g"), i("kycklingfilé", 400, "g"), i("grön pesto", 1, "burk"), i("körsbärstomater", 250, "g"),
   i("rucola", 65, "g"), i("parmesan", 50, "g"), i("olja")],
  ["Koka pastan.", "Stek kycklingen i bitar.", "Blanda pasta, pesto, kyckling och halverade tomater.",
   "Toppa med rucola och parmesan."])
r("Tomatsoppa med ostmacka", "🥫", 20, ["veg", "billig"],
  [i("passerade tomater", 1000, "g"), i("gul lök", 1, "st"), i("vitlök", 2, "klyftor"), i("buljongtärning", 1, "st"),
   i("matlagningsgrädde", 1, "dl"), i("rostbröd", 8, "skivor"), i("cheddar", 150, "g"), i("smör"), i("färsk basilika", 1, "kruka")],
  ["Fräs lök och vitlök.", "Tillsätt tomater, buljong och 3 dl vatten, koka 10 min.", "Mixa med grädde.",
   "Stek ostmackor i smör tills osten smält. Doppa!"])
r("Röd linssoppa", "🥣", 25, ["veg", "billig", "matlåda"],
  [i("röda linser", 3, "dl"), i("gul lök", 1, "st"), i("morot", 2, "st"), i("spiskummin", 1, "tsk"),
   i("krossade tomater", 400, "g"), i("buljongtärning", 2, "st"), i("citron", 1, "st"), i("turkisk yoghurt", 2, "dl")],
  ["Fräs lök, morot och spiskummin.", "Tillsätt linser, tomat, buljong och 1 liter vatten.",
   "Koka 15 min, mixa slät.", "Pressa i citron. Toppa med yoghurt."])
r("Ugnsfalukorv med ost & senap", "🧀", 25, ["billig"],
  [i("falukorv", 600, "g"), i("senap", 3, "msk"), i("riven ost", 100, "g"), i("tomat", 2, "st"),
   i("potatismospulver", 1, "paket"), i("mjölk", 4, "dl"), i("smör", 2, "msk")],
  ["Snitta korven, fyll med senap och tomatskivor.", "Strö ost över, ugn 225° i 15 min.",
   "Rör ihop moset.", "Servera – barndom på en tallrik."])
r("Ugnstorsk med citron & ris", "🐠", 25, [],
  [i("torskfilé", 500, "g"), i("citron", 1, "st"), i("crème fraiche", 2, "dl"), i("dill", 1, "kruka"),
   i("ris", 4, "dl"), i("broccoli", 1, "st"), i("salt"), i("peppar")],
  ["Koka riset.", "Lägg torsken i form, bred över crème fraiche med citronskal och dill.",
   "Ugn 200° i 15 min.", "Koka broccolin 3 min. Servera."])
r("Chili sin carne", "🌶️", 25, ["veg", "billig", "matlåda"],
  [i("kidneybönor", 1, "burk"), i("svarta bönor", 1, "burk"), i("gul lök", 1, "st"), i("paprika", 1, "st"),
   i("krossade tomater", 800, "g"), i("spiskummin", 1, "tsk"), i("paprikapulver", 1, "msk"), i("chiliflakes"),
   i("ris", 4, "dl"), i("crème fraiche", 2, "dl")],
  ["Koka riset.", "Fräs lök, paprika och kryddor.", "Tillsätt bönor och tomater, puttra 15 min.", "Toppa med crème fraiche."])
r("Bönquesadillas", "🫓", 15, ["veg", "snabb", "billig"],
  [i("tortillabröd", 8, "st"), i("svarta bönor", 1, "burk"), i("majs", 1, "burk"), i("riven ost", 200, "g"),
   i("salsa", 1, "burk"), i("spiskummin")],
  ["Mosa bönorna grovt med spiskummin.", "Bred på bröd, strö över majs och ost, lägg på ett bröd till.",
   "Stek gyllene på båda sidor.", "Skär i trianglar, doppa i salsa."])
r("Pasta bolognese", "🍝", 30, ["matlåda"],
  [i("nötfärs", 500, "g"), i("pasta", 400, "g"), i("gul lök", 1, "st"), i("morot", 1, "st"), i("vitlök", 2, "klyftor"),
   i("krossade tomater", 800, "g"), i("tomatpuré", 2, "msk"), i("buljongtärning", 1, "st"), i("oregano"), i("parmesan", 50, "g")],
  ["Bryn färsen med lök, morot och vitlök.", "Tillsätt tomatpuré, tomater, buljong och oregano.",
   "Puttra 15 min medan pastan kokar.", "Servera med parmesan."])
r("Krämig svamprisotto", "🍄", 30, ["veg"],
  [i("arborioris", 3, "dl"), i("champinjoner", 250, "g"), i("gul lök", 1, "st"), i("vitt vin", 1, "dl"),
   i("buljongtärning", 2, "st"), i("parmesan", 80, "g"), i("smör", 2, "msk"), i("timjan")],
  ["Fräs lök och svamp i smör.", "Rör ner riset, häll i vinet.", "Tillsätt varm buljong lite i taget under omrörning, ca 18 min.",
   "Rör ner parmesan och en klick smör."])
r("Räkpasta med vitlök & chili", "🦐", 15, ["snabb"],
  [i("pasta", 400, "g"), i("räkor", 300, "g"), i("vitlök", 3, "klyftor"), i("chili", 1, "st"), i("citron", 1, "st"),
   i("körsbärstomater", 250, "g"), i("olja"), i("rucola", 65, "g")],
  ["Koka pastan.", "Fräs vitlök och chili i olja, tillsätt tomaterna.", "Vänd ner räkorna, bara värm.",
   "Blanda med pasta, citron och rucola."])
r("Shakshuka", "🍳", 25, ["veg"],
  [i("ägg", 6, "st"), i("krossade tomater", 800, "g"), i("paprika", 2, "st"), i("gul lök", 1, "st"), i("vitlök", 2, "klyftor"),
   i("spiskummin", 1, "tsk"), i("paprikapulver", 1, "tsk"), i("fetaost", 150, "g"), i("pitabröd", 4, "st")],
  ["Fräs lök, paprika, vitlök och kryddor.", "Tillsätt tomaterna, puttra 10 min.", "Gör gropar och knäck i äggen, lock på 6–8 min.",
   "Smula över feta. Doppa bröd!"])
r("Couscoussallad med kyckling", "🥗", 20, ["snabb", "matlåda"],
  [i("couscous", 3, "dl"), i("kycklingfilé", 400, "g"), i("gurka", 1, "st"), i("körsbärstomater", 250, "g"),
   i("fetaost", 150, "g"), i("rödlök", 1, "st"), i("citron", 1, "st"), i("olja")],
  ["Häll kokande vatten över couscousen, lock på 5 min.", "Stek kycklingen.", "Hacka grönsakerna.",
   "Blanda allt med citron och olja."])
r("Tortillapizza", "🍕", 15, ["snabb", "billig"],
  [i("tortillabröd", 8, "st"), i("passerade tomater", 500, "g"), i("riven ost", 200, "g"), i("skinka", 150, "g"),
   i("champinjoner", 250, "g"), i("oregano")],
  ["Sätt ugnen på 250°.", "Bred tomat på bröden, strö över oregano.", "Toppa med skinka, svamp och ost.",
   "Grädda 6–8 min tills krispigt."])
r("Gnocchi med tomat & mozzarella", "🧀", 20, ["veg", "snabb"],
  [i("gnocchi", 500, "g"), i("krossade tomater", 400, "g"), i("vitlök", 2, "klyftor"), i("mozzarella", 125, "g"),
   i("färsk basilika", 1, "kruka"), i("olja")],
  ["Stek gnocchin gyllene i olja.", "Tillsätt vitlök och tomater, puttra 5 min.", "Riv över mozzarella, gratinera eller lock på.",
   "Toppa med basilika."])
r("Snabb nudelsoppa med ägg", "🍜", 15, ["veg", "snabb", "billig"],
  [i("risnudlar", 200, "g"), i("ägg", 4, "st"), i("buljongtärning", 2, "st"), i("soja", 3, "msk"), i("färsk ingefära", 1, "bit"),
   i("salladslök", 3, "st"), i("sockerärtor", 150, "g"), i("sambal oelek")],
  ["Koka 1,5 l buljong med ingefära och soja.", "Koka äggen 7 min.", "Lägg nudlar och sockerärtor i buljongen 3 min.",
   "Toppa med halverade ägg, salladslök och sambal."])
r("Kyckling med jordnötssås", "🥜", 25, ["matlåda"],
  [i("kycklinglårfilé", 600, "g"), i("jasminris", 4, "dl"), i("jordnötssmör", 3, "msk"), i("kokosmjölk", 400, "ml"),
   i("soja", 2, "msk"), i("lime", 1, "st"), i("röd currypasta", 1, "msk"), i("broccoli", 1, "st")],
  ["Koka riset.", "Stek kycklingen i bitar.", "Rör ner currypasta, jordnötssmör, kokosmjölk och soja. Puttra 8 min.",
   "Koka broccolin. Pressa lime över."])
r("Laxpasta med spenat & citron", "🐟", 20, ["snabb"],
  [i("pasta", 400, "g"), i("laxfilé", 400, "g"), i("spenat", 65, "g"), i("matlagningsgrädde", 2.5, "dl"),
   i("citron", 1, "st"), i("vitlök", 1, "klyfta"), i("parmesan", 50, "g")],
  ["Koka pastan.", "Stek laxen i bitar.", "Häll i grädde, vitlök och citronskal.", "Vänd ner spenat och pasta. Riv över parmesan."])
r("Hamburgare med pommes", "🍔", 25, ["snabb"],
  [i("hamburgare", 4, "st"), i("hamburgerbröd", 4, "st"), i("ugnspommes", 750, "g"), i("cheddar", 4, "skivor"),
   i("sallad", 1, "st"), i("tomat", 2, "st"), i("rödlök", 1, "st"), i("ketchup"), i("senap")],
  ["Ugnsbaka pommesen.", "Stek burgarna, lägg på ost sista minuten.", "Rosta bröden.", "Bygg och njut."])
r("Raggmunk med fläsk", "🥓", 30, ["billig"],
  [i("potatis", 800, "g"), i("vetemjöl", 2, "dl"), i("mjölk", 4, "dl"), i("ägg", 2, "st"), i("rimmat sidfläsk", 400, "g"),
   i("lingonsylt"), i("smör"), i("salt")],
  ["Vispa mjöl, mjölk, ägg och salt till smet.", "Riv potatisen och blanda i.", "Stek fläsket krispigt.",
   "Stek tunna raggmunkar i smör. Servera med lingon."])
r("Grekisk pastasallad", "🫒", 20, ["veg", "matlåda"],
  [i("pasta", 400, "g"), i("fetaost", 150, "g"), i("gurka", 1, "st"), i("körsbärstomater", 250, "g"), i("oliver", 1, "burk"),
   i("rödlök", 1, "st"), i("oregano"), i("olja"), i("citron", 1, "st")],
  ["Koka och skölj pastan kall.", "Hacka grönsakerna.", "Blanda med feta, oliver, olja, citron och oregano.",
   "Perfekt i matlådan i morgon."])
r("Stekt ris med ägg", "🍚", 20, ["veg", "snabb", "billig", "matlåda"],
  [i("ris", 4, "dl"), i("ägg", 4, "st"), i("frysta ärtor", 200, "g"), i("morot", 2, "st"), i("salladslök", 3, "st"),
   i("soja", 3, "msk"), i("vitlök", 2, "klyftor"), i("olja")],
  ["Koka riset (eller använd gårdagens!).", "Woka morot, vitlök och ärtor.", "Skjut åt sidan, rör ihop äggen i pannan.",
   "Vänd ner riset och soja. Toppa med salladslök."])
r("Thaigryta med tofu", "🥥", 25, ["veg", "matlåda"],
  [i("tofu", 400, "g"), i("röd currypasta", 2, "msk"), i("kokosmjölk", 400, "ml"), i("paprika", 1, "st"),
   i("sockerärtor", 150, "g"), i("lime", 1, "st"), i("färsk koriander", 1, "kruka"), i("jasminris", 4, "dl"), i("soja", 1, "msk")],
  ["Koka riset.", "Stek tofun i tärningar gyllene.", "Fräs currypastan, häll i kokosmjölk, paprika och sockerärtor, 5 min.",
   "Vänd ner tofun, smaka av med lime och soja. Toppa med koriander."])
r("Kycklingfajitas", "🫑", 25, ["snabb"],
  [i("kycklingfilé", 500, "g"), i("paprika", 2, "st"), i("rödlök", 1, "st"), i("tortillabröd", 8, "st"),
   i("tacokrydda", 1, "påse"), i("avokado", 2, "st"), i("lime", 1, "st"), i("crème fraiche", 2, "dl")],
  ["Strimla kyckling, paprika och lök.", "Stek hett med tacokryddan.", "Mosa avokado med lime och salt.",
   "Rulla in i varma tortillas."])
r("Potatis- & purjolökssoppa", "🥔", 30, ["veg", "billig", "matlåda"],
  [i("potatis", 600, "g"), i("purjolök", 2, "st"), i("buljongtärning", 2, "st"), i("matlagningsgrädde", 2, "dl"),
   i("smör", 2, "msk"), i("rostbröd", 4, "skivor"), i("timjan")],
  ["Fräs purjolöken i smör.", "Tillsätt tärnad potatis, buljong och 1 l vatten. Koka 15 min.",
   "Mixa med grädde och timjan.", "Servera med rostat bröd."])


# ---- Ungefärliga normalpriser (kr per recept-enhet), ca hösten 2026 ----
def per(unit, pairs):
    return {n: {unit: kr} for n, kr in pairs.items()}
PRIS = {}
for d in [
  per("g", {"bacon": .12, "champinjoner": .06, "cheddar": .12, "falukorv": .06, "fetaost": .12, "fryst spenat": .04,
            "frysta wokgrönsaker": .05, "frysta ärtor": .04, "färsk tortellini": .08, "gnocchi": .05, "halloumi": .16,
            "krossade tomater": .025, "kycklingfilé": .11, "kycklinglårfilé": .10, "körsbärstomater": .10, "köttbullar": .10,
            "laxfilé": .25, "mozzarella": .14, "nötfärs": .10, "parmesan": .35, "passerade tomater": .025, "pasta": .03,
            "potatis": .015, "risnudlar": .06, "riven ost": .10, "rimmat sidfläsk": .12, "rucola": .30, "räkor": .25,
            "skinka": .14, "sockerärtor": .15, "spenat": .25, "tofu": .07, "torskfilé": .22, "ugnspommes": .03, "äggnudlar": .05}),
  per("st", {"avokado": 12, "broccoli": 20, "buljongtärning": 2, "chili": 4, "citron": 6, "gul lök": 2, "gurka": 15,
             "hamburgare": 15, "hamburgerbröd": 5, "lime": 5, "morot": 1.5, "paprika": 12, "pitabröd": 6, "purjolök": 12,
             "rödlök": 3, "sallad": 18, "salladslök": 4, "tomat": 5, "tortillabröd": 3, "ägg": 3}),
  per("dl", {"arborioris": 4, "couscous": 3, "crème fraiche": 9, "jasminris": 3, "makaroner": 1.5, "matlagningsgrädde": 6,
             "mjölk": 1.5, "ris": 2, "röda linser": 4, "turkisk yoghurt": 5, "vetemjöl": .7, "vitt vin": 10}),
  per("msk", {"currypulver": 1.5, "garam masala": 2, "jordnötssmör": 2, "ostronsås": 1.5, "paprikapulver": 1,
              "röd currypasta": 3, "soja": 1, "tomatpuré": 1, "senap": 1, "smör": 1.5}),
  per("tsk", {"spiskummin": .5}), per("ml", {"kokosmjölk": .06}),
  per("kruka", {"dill": 20, "färsk basilika": 20, "färsk koriander": 20}), per("bit", {"färsk ingefära": 5}),
  per("klyfta", {"vitlök": 1}), per("paket", {"falafel": 35, "fiskpinnar": 40, "potatismospulver": 20}),
  per("påse", {"pyttipanna": 35, "tacokrydda": 10}),
  per("burk", {"grön pesto": 30, "kidneybönor": 10, "kikärtor": 10, "majs": 12, "oliver": 25, "salsa": 25, "svarta bönor": 10}),
]:
    for n, v in d.items(): PRIS.setdefault(n, {}).update(v)
PRIS["cheddar"]["skivor"] = 2.5; PRIS["rostbröd"] = {"skivor": 1.5}
PRIS["vitlök"]["klyftor"] = 1; PRIS["kikärtor"]["burkar"] = 10; PRIS["paprikapulver"]["tsk"] = .35

def kostnad(r):
    tot = 0
    for g in r["ingredienser"]:
        if g["mangd"] is None: continue          # skafferi/kryddor räknas som hemma
        assert g["namn"] in PRIS and g["enhet"] in PRIS[g["namn"]], ("pris saknas", g)
        tot += g["mangd"] * PRIS[g["namn"]][g["enhet"]]
    return tot

# ---- Kök -> Veckans DJ ----
KOK = {
 "italienskt": [1, 7, 16, 17, 24, 25, 26, 29, 30, 33], "mexikanskt": [5, 22, 23, 39], "asiatiskt": [15, 31, 37],
 "indiskt": [6, 10], "thai": [32, 38], "svenskt": [2, 3, 11, 12, 20, 35, 40], "havet": [4, 8, 21],
 "amerikanskt": [13, 18, 34], "mellanöstern": [9, 19, 27, 28], "grekiskt": [36], "franskt": [14],
}
DJ = {
 "italienskt": {"namn": "Italiensk trattoria", "emoji": "🇮🇹", "lat": ["That's Amore – Dean Martin", "Volare – Domenico Modugno", "Funiculì, funiculà – Luciano Pavarotti"]},
 "mexikanskt": {"namn": "Fiesta mexicana", "emoji": "🎺", "lat": ["La Bamba – Ritchie Valens", "Tequila – The Champs", "Oye Como Va – Santana"]},
 "asiatiskt": {"namn": "Wok'n'roll", "emoji": "🥢", "lat": ["Kung Fu Fighting – Carl Douglas", "Sukiyaki – Kyu Sakamoto", "Gangnam Style – PSY"]},
 "indiskt": {"namn": "Bollywood-kväll", "emoji": "💃", "lat": ["Jai Ho – A.R. Rahman", "Mundian To Bach Ke – Panjabi MC", "Chaiyya Chaiyya – A.R. Rahman"]},
 "thai": {"namn": "Bangkok-nätter", "emoji": "🌴", "lat": ["One Night in Bangkok – Murray Head", "Kung Fu Fighting – Carl Douglas", "Sukiyaki – Kyu Sakamoto"]},
 "svenskt": {"namn": "Svensk husmanspop", "emoji": "🇸🇪", "lat": ["Sommartider – Gyllene Tider", "Dancing Queen – ABBA", "Flickorna på TV2 – Gyllene Tider"]},
 "havet": {"namn": "Under ytan", "emoji": "🌊", "lat": ["Under the Sea – Samuel E. Wright", "(Sittin' On) The Dock of the Bay – Otis Redding", "Octopus's Garden – The Beatles"]},
 "amerikanskt": {"namn": "Diner-jukebox", "emoji": "🍔", "lat": ["Johnny B. Goode – Chuck Berry", "Hound Dog – Elvis Presley", "Shake It Off – Taylor Swift"]},
 "mellanöstern": {"namn": "Basar-beats", "emoji": "🧆", "lat": ["Aïcha – Khaled", "Didi – Khaled", "Ya Rayah – Rachid Taha"]},
 "grekiskt": {"namn": "Grekisk taverna", "emoji": "🏛️", "lat": ["Zorba's Dance – Mikis Theodorakis", "Misirlou – Dick Dale", "Mamma Mia – ABBA"]},
 "franskt": {"namn": "Parisisk bistro", "emoji": "🥐", "lat": ["La Vie en rose – Édith Piaf", "Les Champs-Élysées – Joe Dassin", "Non, je ne regrette rien – Édith Piaf"]},
}

assert len(R) == 40, len(R)
for x in R:
    assert x["tid"] <= 30, x["namn"]
    assert set(x["taggar"]) <= {"snabb", "billig", "veg", "matlåda"}
    if "snabb" in x["taggar"]: assert x["tid"] <= 25, x["namn"]
VEG_FORBJUDET = {K}
for x in R:
    if "veg" in x["taggar"]:
        assert not any(ING[g["namn"]] == K for g in x["ingredienser"]), x["namn"]

ids = sorted(i for v in KOK.values() for i in v)
assert ids == list(range(1, 41)), "varje recept ska ha exakt ett kök"
for k, v in KOK.items():
    for rid in v: R[rid - 1]["kok"] = k
for x in R: x["kostnad"] = round(kostnad(x))
billiga = sorted(x["kostnad"] for x in R if "billig" in x["taggar"])
ovriga = sorted(x["kostnad"] for x in R if "billig" not in x["taggar"])
print("median billig", billiga[len(billiga)//2], "kr, övriga", ovriga[len(ovriga)//2], "kr")
for x in R:
    if "billig" in x["taggar"]: assert x["kostnad"] <= 100, (x["namn"], x["kostnad"])
ut = {"avdelningar": AVD, "basvaror": BAS, "ingredienser": ING, "priser": PRIS, "dj": DJ, "recept": R}
p = pathlib.Path(__file__).resolve().parent.parent / "recipes.json"
p.write_text(json.dumps(ut, ensure_ascii=False, indent=1))
print("OK", len(R), "recept,", len(ING), "ingredienser")
