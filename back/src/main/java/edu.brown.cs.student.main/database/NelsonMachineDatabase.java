package edu.brown.cs.student.main.database;

import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import com.squareup.moshi.Types;
import edu.brown.cs.student.main.records.Machine;

import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Class representing the nelson machine database. Parses the database and converst into a
 * list of machines.
 */
public class NelsonMachineDatabase {

    private HashMap<String, Machine> database;

    public NelsonMachineDatabase() throws IOException {
        this.makeDatabase();
    }

    private void makeDatabase() throws IOException {
        this.parseData();

    }

    /**
     * Populates database variable with the machines from the machineData.json file
     * @throws IOException - throws exception if issue reading json, which never occurs
     */
    private void parseData() throws IOException {
        Moshi moshi = new Moshi.Builder().build();
        Type type = Types.newParameterizedType(List.class, Machine.class);
        JsonAdapter<List<Machine>> adapter =
                moshi.adapter(type); // creates moshi object that will read json
        List<Machine> machineList= adapter.fromJson(new String(Files.readAllBytes(Paths.get("data/machineData.json"))));
        this.database = new HashMap<>();

        for (Machine machine: machineList){
            this.database.put(machine.getName(), machine);

        }
    }


    /**
     * returns database
     * @return - map from name to machine objects
     */
    public HashMap<String, Machine> getDatabase(){
        return this.database;
    }

}
