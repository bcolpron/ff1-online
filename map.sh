
echo var tiles= \[ 
for i in {0..255}; do
    echo -n "    " \[
    for j in {0..255}; do
        a=$(grep $(grep $(printf "%03d" $i)/$(printf "%03d" $j) tiles.txt | cut -f 1 -d \ ) legend.txt | cut -f 2 -d \ )
        echo -n $a,
    done
    echo \],
done
echo ]\;

#echo var tiles= \[; for i in {0..2}; do echo -n "    " \[; for j in {0..3}; do echo -n 0,; done ; echo \],; done; echo \]\;
