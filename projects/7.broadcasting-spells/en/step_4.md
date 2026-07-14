## The grow spell

<div style="display: flex; flex-wrap: wrap">
<div style="flex-basis: 200px; flex-grow: 1; margin-right: 15px;">
You also need a grow spell to return the **Fairy** sprite to normal size or to make a massive fairy!
</div>
<div>
![](images/growing-spell.png){:width="300px"}
</div>
</div>

**Tip:** In this step, you will add code to three different sprites. Make sure you select the correct sprite from the Sprite list below the Stage and click on the **Code** tab.

--- task ---

Add a script to the **grow** button sprite to `broadcast`{:class="block3events"} a `grow`{:class="block3events"} message:

![](images/grow-icon.png)

```blocks3
when this sprite clicked
broadcast (grow v)
```

--- /task ---

--- task ---

Add a script to get the **Fairy** sprite to grow:

![](images/fairy-icon.png)

```blocks3
when I receive [grow v]
change size by [10] // positive numbers increase the size
```

--- /task ---

You can reverse the 'shrink' sound to make a 'grow' sound!

--- task ---

Select the **Wand** sprite.

![](images/wand-icon.png)

Click on the **Sounds** tab.

--- /task ---

--- task ---

Right-click (or tap and hold) the **shrink** sound and choose **duplicate**.

![The shrink sound with popup menu showing duplicate.](images/duplicate-sound.png)

Name the copy `grow`.

--- /task ---

--- task ---

Click on the **Reverse** icon to make the sound play backwards.

![The grow sound with the reverse icon highlighted.](images/reverse-sound.png)

--- /task ---

--- task ---

Add a script to the **Wand** sprite to play the `grow`{:class="block3sound"} sound when the `grow`{:class="block3events"} message is received:

```blocks3
when I receive [grow v]
play sound [grow v] until done
```

--- /task ---

--- task ---

**Test:** Click on the **shrink** and **grow** spell buttons to cast the spells as many times as you like.

--- /task ---

--- save ---

