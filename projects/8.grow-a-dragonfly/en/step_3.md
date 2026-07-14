## A fly to eat

<div style="display: flex; flex-wrap: wrap">
<div style="flex-basis: 200px; flex-grow: 1; margin-right: 15px;">
You will add an insect for the dragonfly to eat. 
</div>
<div>
![The Stage with a dragonfly and an insect.](images/fly-to-eat.png){:width="300px"}
</div>
</div>

There's a fly in the **Frog 2** sprite that you can use.

--- task ---

Add the **Frog 2** sprite to your project. Rename the sprite to `Insect`:

![The Sprite list with Frog 2 sprite added. The Sprite name property shows 'Insect'.](images/fly-sprite.png)


--- /task ---

You only need the fly, not the frog.

--- task ---

Click on the **Costumes** tab. Click on the fly to select it and click on the **Copy** icon.

![The paint editor with the fly part of the Frog 2-a costume selected and the Copy icon highlighted.](images/copy-fly.png)

--- /task ---

--- task ---

Add a new costume to the sprite using the **Paint** option:

![The paint option selected in the choose a costume menu.](images/paint-sprite.png)

--- /task ---

--- task ---

Click on the **Paste** icon to paste the sprite into the new costume. Drag the fly to the **centre** so it lines up with the crosshair.

Rename your costume `Insect` and delete the other costumes, as you won't need those:

![The paint editor showing a pasted new Insect costume with the Paste icon highlighted. The costume list shows the other costumes have been deleted.](images/fly-costume.png)

--- /task ---

--- task ---

Increase the size of the fly so that it's easier to see and catch:

![Size property set to 150.](images/fly-size.png)

--- /task ---

--- task ---

Click on the **Code** tab and add a script to make the **Insect** sprite bounce around:

![](images/fly-icon.png)

```blocks3
when flag clicked
forever
move [3] steps
if on edge, bounce
end
```

The `if on edge, bounce`{:class="block3motion"} block checks to see if the sprite has reached the edge of the Stage and points the sprite in a different direction if it has. 

--- /task ---

You want the **Insect** sprite to `hide`{:class="block3looks"} `if`{:class="block3control"} it gets eaten by the **Dragonfly** sprite. 

--- task ---

Add an `if`{:class="block3control"} block to the **Insect** sprite's movement script:

```blocks3
when flag clicked
forever
move [3] steps
if on edge, bounce
+if < > then 
end
```
--- /task ---

The `if`{:class="block3control"} has a hexagon-shaped input. This means you can put a **condition** here. 

When the `if`{:class="block3control"} block runs, Scratch will check the condition. If the condition is 'true' `then`{:class="block3control"} the code inside the `if`{:class="block3control"} block will run.

You want the insect to `hide`{:class="block3looks"} `if`{:class="block3control"} it is `touching`{:class="block3sensing"} the **Dragonfly** sprite.

--- task ---

Drag a `touching [Dragonfly v]`{:class="block3sensing"} into the `if`{:class="block3control"} block. Add a `hide`{:class="block3looks"} block inside the `if`{:class="block3control"} block.

```blocks3
when flag clicked
forever
move [3] steps
if on edge, bounce
+if <touching [Dragonfly v] ?> then // change from 'mouse-pointer'
+hide // eaten
end
```

--- /task ---

--- task ---

**Test:** Test your code and control the dragonfly to eat the fly. The fly should disappear.

--- /task ---

The dragonfly won't get very big if it can only eat one fly! 

--- task ---

Add blocks to make the hidden insect sprite `go to a random position`{:class="block3motion"} on the Stage, `wait`{:class="block3control"} for one second then `show`{:class="block3looks"}:

```blocks3
when flag clicked
+show // show at the start
forever
move [3] steps
if on edge, bounce
if <touching [Dragonfly v] ?> then
hide
+go to (random position v)
+wait [1] seconds
+show // to look like a new fly
end
end
```

--- /task ---

--- task ---

**Test:** Test that your dragonfly can now eat lots of flies.

Make sure you have added the `show`{:class="block3looks"} block at the start.

--- /task ---

**Tip:** You can click the red **Stop** button above the Stage if you want the dragonfly to be quiet while you add more code.

--- save ---
