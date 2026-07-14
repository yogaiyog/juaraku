
--- question ---

---
legend: Question 3 of 3
---

You used this script to control what happens when the player clicks on the button to upgrade their drum:

```blocks3
when this sprite clicked
if <(beats)>  [29]> then 
hide
change [beats v] by [-30] 
broadcast (conga v) 
else
say [Not enough beats!] for [2] seconds 
end
```

If the value of the `beats`{:class="block3variables"} variable is `29`, what will happen when the player clicks on the button?

--- choices ---

- ( ) The sprite will `hide`{:class="block3looks"}

  --- feedback ---

  Not quite, there is a `hide`{:class="block3looks"} block in the script, but it will not run with `29` `beats`{:class="block3variables"}. Take a look at the script again. 

  --- /feedback ---

- (x) The button sprite will `say`{:class="block3looks"} `Not enough beats!`

  --- feedback ---

Yes, the condition checks if `beats`{:class="block3variables"} is greater than `29`, but `beats`{:class="block3variables"} is equal to `29` so the player does not have enough.

  --- /feedback ---

- ( ) 30 will be taken away from the value of the `beats`{:class="block3variables"} variable

  --- feedback ---

  No, the value of the `beats`{:class="block3variables"} variable will stay the same. `beats`{:class="block3variables"} is `29` which means `beats`{:class="block3variables"} `> 29` is false, so the blocks in the first part of the `if`{:class="block3control"} block will not run.

  --- /feedback ---

- ( ) Nothing

  --- feedback ---

  No, the script will always do something. Take a closer look to see which part of the script will run when you have `29` `beats`{:class="block3variables"}.

  --- /feedback ---

--- /choices ---

--- /question ---
