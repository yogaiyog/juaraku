## Jump, hop, bounce, or glide!

<div style="display: flex; flex-wrap: wrap">
<div style="flex-basis: 200px; flex-grow: 1; margin-right: 15px;">
In this step, you will code your character to jump from start to end platforms. 
</div>
<div>
![](images/jump-example.png){:width="300px"}
</div>
</div>

You're going to make your character jump across the Stage. Don't worry about falling in yet.

--- task ---

**Choose:** Add a jumping sound that suits your character.

[[[generic-scratch3-sound-from-library]]]

Now make your character jump across the Stage by pressing the <kbd>space</kbd> bar on a keyboard or tapping the Stage on a tablet.

[[[scratch3-top-down-jumping]]]

--- /task ---

--- task ---

**Test:** Tap the <kbd>space</kbd> bar or Stage to make your character jump across the Stage to the **End** platform.

Adjust your code until the character jumps across the Stage in three or four jumps.

--- /task ---

**Tip:** It's really common for games to have a `forever`{:class="block3control"} block with `if`{:class="block3control"} statements inside it to do something when important conditions become true

--- task ---

**Debug:**

--- collapse ---

---
title: My sprite doesn't go to the Start platform when I click the green flag
---

Check that you have a setup script on your **character** sprite.


```blocks3
when flag clicked // setup
+go to (Start v)
set [landed v] to [0]
set size to (landed) %
+go to [front v] layer
show
broadcast (start v) // start other scripts
```

Check that that name in the `go to`{:class="block3motion"} block matches the name of your **Start** sprite.

Check that you have a `go to front layer`{:class="block3looks"} block. Your sprite might be underneath the Start plaform!

Make sure you haven't hidden your **character** sprite. Add a `show`{:class="block3looks"} block to your setup script if you need to.


--- /collapse ---

--- collapse ---

---
title: My sprite doesn't go to the centre of the Start platform
---

You need to make sure all your sprite costumes are centered in the Paint editor. 

The `go to`{:class="block3motion"} `other sprite`{:class="block3motion"} block moves a sprite so that its centre is in the same position as the centre of the other sprite. If their centres are in the wrong place, then your **character** won't go to the centre of the platforms.

--- /collapse ---

--- collapse ---

---
title: My sprite points or jumps in the wrong direction!
---

Add a `point in direction`{:class="block3motion"} block to the **character**'s setup script or change the direction in the sprite pane. You might also need to change the `rotation style`{:class="block3motion"}. You might also need to rotate the **costume** of your sprite so that it faces to the right.

--- /collapse ---

--- collapse ---

---
title: My sprite doesn't jump the right distance
---

Look at your **character**'s `when I receieve (jump)`{:class="block3events"} script. Try changing the number of steps in the `move`{:class="block3motion"} blocks, or the number of repeats in the `repeat`{:class="block3control"} blocks.

```blocks3
+move [5] steps
```

Remember, you will need to change the numbers for the up and down parts of the jump. 

--- /collapse ---

--- collapse ---

---
title: My sprite doesn't grow and shrink correctly when it jumps
---

Make sure you have a `broadcast (start)`{:class="block3events"} block at the end of your **character**'s `when flag clicked`{:class="block3events"} script.

Look at your **character**'s `when I receieve (start)`{:class="block3events"} script. 

Make sure that the `change size`{:class="block3looks"} block in the second `repeat`{:class="block3events"} block has a negative number to make the sprite smaller such as `-3`.

--- /collapse ---

If you have a bug that we haven't covered here, then let us know in the feedback. If you fixed the bug yourself (well done!), let us know that too. 

**Tip:** If you're stuck, try reading your code out loud or in your head to make sure it says what you think it does. You might find the bug.

--- /task ---

--- save ---
