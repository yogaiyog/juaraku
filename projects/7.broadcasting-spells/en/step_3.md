## The shrink spell

<div style="display: flex; flex-wrap: wrap">
<div style="flex-basis: 200px; flex-grow: 1; margin-right: 15px;">
Now you will get the Fairy to shrink when you click on the shrink button.
</div>
<div>
![](images/shrinking-fairy.png){:width="300px"}
</div>
</div>

--- task ---

Click on the **shrink** sprite in the Sprite list below the Stage. 

![](images/shrink-icon.png)

--- /task ---

--- task ---

Add a `when this sprite clicked`{:class="block3events"} block:

```blocks3
when this sprite clicked
```

--- /task ---

The **shrink** sprite needs to `broadcast`{:class="block3events"} a `message`{:class="block3events"} so that the **Fairy** sprite knows that the shrink spell has been cast.

--- task ---

Add a `broadcast`{:class="block3events"} block:

```blocks3
when this sprite clicked
+ broadcast (message1 v)
```

--- /task ---

--- task ---

Click on `message1`{:class="block3events"} and choose 'New message'. 

Name the new message `shrink`.

![New message dialog with shrink entered.](images/new-message.png)

Your code should look like this:

```blocks3
when this sprite clicked
broadcast (shrink v)
```

--- /task ---

Now when you click on the **shrink** button, Scratch will `broadcast`{:class="block3events"} the `shrink`{:class="block3events"} message, but nothing will happen yet.

--- task ---

Click on the **Fairy** sprite in the Sprite list below the Stage.

![](images/fairy-icon.png)

--- /task ---

--- task ---

Add code to the **Fairy** sprite to shrink when it receives a `shrink`{:class="block3events"} message:

```blocks3
when I receive [shrink v]
change size by [-10] // negative numbers decrease the size
```

--- /task ---

--- task ---

**Test:** Click on the **shrink** button to shrink the **Fairy** sprite. Do this as many times as you like.

**Debug:** If your **Fairy** sprite grows instead of shrinks, add a minus `-` before the number `10` to make a negative number `-10`.

--- /task ---

--- task ---

Add a script to set the **Fairy** sprite to normal size `when the green flag`{:class="block3events"} is clicked:

```blocks3
when flag clicked
set size to [100] %
```

--- /task ---

When messages are `broadcast`{:class="block3events"} they can be received by all sprites. When the **Wand** `receives`{:class="block3events"} the `shrink`{:class="block3events"} message it should `play a sound`{:class="block3sound"}.

--- task ---

Click on the **Wand** sprite. 

![](images/wand-sprite-icon.png)

--- /task ---

--- task ---

Click the **Sounds** tab.

--- /task ---

--- task ---

Delete the Magic Spell sound.

--- /task ---

--- task ---

Add the **Slide Whistle** sound and rename it to `shrink`.

![The Sounds tab with added slide whistle sound renamed to shrink in the Sound property.](images/slide-whistle.png)

--- /task ---

--- task ---

Add a script to play the sound:

```blocks3
when I receive [shrink v]
play sound [shrink v] until done

```

--- /task ---

--- task ---

**Test:** Click on the green flag to run your project. Click on the **shrink** button to hear the sound and see the **Fairy** shrink.

--- /task ---

The **shrink** button `broadcasts`{:class="block3events"} a `shrink`{:class="block3events"} message. Both the **Fairy** and the **Wand** sprite `received`{:class="block3events"} the message and responded.

--- save ---
